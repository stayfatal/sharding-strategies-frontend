import { useEffect, useMemo, useRef, useState } from "react";
import { cosineSimilarity } from "../modules/math";

export type ClipSearchItem = {
  id: number;
  description: string;
};

export interface ProcessedClipItem extends ClipSearchItem {
  score: number;
  isVisible: boolean;
  embedding?: number[];
}

function normalizeProgress(raw: unknown): number | null {
  if (raw === null || typeof raw !== "object") return null;
  const o = raw as { status?: string; progress?: number };
  if (typeof o.progress !== "number") return null;
  const p = o.progress;
  if (p <= 1 && p >= 0) return Math.round(p * 100);
  return Math.min(100, Math.round(p));
}

export const useStrategyImageSearch = (initialItems: ClipSearchItem[], enabled: boolean) => {
  const [items, setItems] = useState<ProcessedClipItem[]>([]);
  const [imageEmbedding, setImageEmbedding] = useState<number[] | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workerError, setWorkerError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const embeddingsReadyRef = useRef(false);
  const pendingFileRef = useRef<File | null>(null);
  const lastUploadedImageNameRef = useRef<string | null>(null);
  const itemsRef = useRef(initialItems);
  itemsRef.current = initialItems;

  const itemsKey = useMemo(
    () => initialItems.map((item) => `${item.id}:${item.description}`).join("|"),
    [initialItems],
  );

  useEffect(() => {
    setWorkerError(null);
    embeddingsReadyRef.current = false;
    pendingFileRef.current = null;

    if (!enabled) {
      workerRef.current?.terminate();
      workerRef.current = null;
      setItems([]);
      setReady(false);
      setProgress(0);
      setImageEmbedding(null);
      return;
    }

    const snapshot = itemsRef.current;

    if (snapshot.length === 0) {
      setItems([]);
      setReady(true);
      setProgress(100);
      setImageEmbedding(null);
      return;
    }

    setItems(snapshot.map((item) => ({ ...item, score: 0, isVisible: true })));
    setReady(false);
    setProgress(0);
    setImageEmbedding(null);

    workerRef.current = new Worker(new URL("../workers/search.worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, data } = e.data as { type: string; data: unknown };

      switch (type) {
        case "progress": {
          const msg = data as { status?: string; progress?: number };
          if (msg?.status === "progress") {
            const p = normalizeProgress(data);
            if (p !== null) setProgress(p);
          } else if (msg?.status === "ready") {
            setReady(true);
          } else {
            const p = normalizeProgress(data);
            if (p !== null) setProgress(p);
          }
          break;
        }
        case "text_embeddings_ready":
          embeddingsReadyRef.current = true;
          setItems((prev) =>
            prev.map((item) => ({
              ...item,
              embedding: (data as Record<number, number[] | undefined>)[item.id],
            })),
          );
          setReady(true);
          setProgress(100);
          {
            const pending = pendingFileRef.current;
            if (pending && workerRef.current) {
              pendingFileRef.current = null;
              workerRef.current.postMessage({ type: "image", data: pending });
            }
          }
          break;
        case "image_embedding_ready":
          setImageEmbedding(data as number[]);
          break;
        case "error":
          setWorkerError(typeof data === "string" ? data : "Worker error");
          setReady(true);
          pendingFileRef.current = null;
          break;
        default:
          break;
      }
    };

    workerRef.current.postMessage({ type: "init", data: snapshot });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [itemsKey, enabled]);

  useEffect(() => {
    if (!imageEmbedding) return;

    setItems((prevItems) => {
      if (!prevItems[0]?.embedding) return prevItems;

      const threshold = 0.04;
      const topK = 5;

      const processed = prevItems.map((item) => {
        if (!item.embedding) return item;

        const similarity = cosineSimilarity(imageEmbedding, item.embedding);

        return {
          ...item,
          score: similarity,
          isVisible: false,
        };
      });

      processed.sort((a, b) => b.score - a.score);

      let visibleCount = 0;
      for (const item of processed) {
        if (visibleCount >= topK) break;
        if (item.score >= threshold) {
          item.isVisible = true;
          visibleCount += 1;
        }
      }

      if (visibleCount === 0) {
        for (const item of processed.slice(0, topK)) {
          item.isVisible = true;
        }
      }

      const uploadedImageName = lastUploadedImageNameRef.current ?? "unknown image";
      const topMatch = processed[0];
      const secondMatch = processed[1];
      const confidenceThreshold = 0.1;
      const scoreGap = topMatch && secondMatch ? topMatch.score - secondMatch.score : null;
      console.groupCollapsed(`[CLIP search] ${uploadedImageName}`);
      console.info("Порог сходства:", threshold, "| Максимум результатов:", topK);
      if (topMatch) {
        const confidenceLabel =
          topMatch.score >= confidenceThreshold ? "достаточная уверенность" : "низкая уверенность (почти угадывание)";
        const gapLabel =
          scoreGap !== null ? `| gap(top1-top2)=${scoreGap.toFixed(4)}` : "| gap(top1-top2)=n/a";
        console.info("Описание картинки от нейронки:", topMatch.description);
        console.info(`score=${topMatch.score.toFixed(4)} | ${confidenceLabel} ${gapLabel}`);
      }
      console.table(
        processed.map((item) => ({
          id: item.id,
          description: item.description,
          score: Number(item.score.toFixed(4)),
          visible: item.isVisible,
        })),
      );
      console.groupEnd();

      return processed;
    });
  }, [imageEmbedding]);

  const searchByImage = (file: File) => {
    lastUploadedImageNameRef.current = file.name || "uploaded image";
    if (!workerRef.current || !embeddingsReadyRef.current) {
      pendingFileRef.current = file;
      return;
    }
    workerRef.current.postMessage({ type: "image", data: file });
  };

  const resetSearch = () => {
    setImageEmbedding(null);
    setWorkerError(null);
    pendingFileRef.current = null;
    setItems((prev) => {
      const sortedById = [...prev].sort((a, b) => a.id - b.id);
      return sortedById.map((item) => ({
        ...item,
        score: 0,
        isVisible: true,
      }));
    });
  };

  return {
    items,
    ready,
    progress,
    imageEmbedding,
    workerError,
    searchByImage,
    resetSearch,
  };
};
