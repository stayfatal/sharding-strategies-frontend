import axios from "axios";
import type { ShardingStrategyJSON } from "./strategiesApi.types";
import { apiBaseUrl, minioPublicBase } from "./runtimeConfig";

export type {
  ShardingStrategyJSON,
  SystemLoadCartJSON,
  SystemLoadJSON,
  SystemLoadStrategyDetailJSON,
  SystemLoadDetailResponse,
} from "./strategiesApi.types";

const baseURL = apiBaseUrl;

/** Список и карточка стратегий (услуги / шардирование): только axios, без swagger-клиента. */
export const strategiesAxios = axios.create({
  baseURL,
});

/**
 * База для ключей MinIO (не http/https/blob/data).
 * В dev по умолчанию через reverse proxy Vite: `/object-media` → localhost:9000 (см. vite.config.ts).
 * Для продакшена задайте VITE_MINIO_PUBLIC_BASE (например полный URL бакета или CDN).
 */
const MINIO_PUBLIC_BASE = minioPublicBase;

export const CART_UPDATED_EVENT = "system-load-cart-updated";

export function strategyClipDescription(strategy: ShardingStrategyJSON): string {
  const en = strategy.short_description_en?.trim();
  if (en) return en;
  return "Database sharding strategy profile.";
}

export function fallbackImageUrl(): string {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="100%" height="100%" fill="#111820"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5d6c74" font-family="sans-serif" font-size="14">Нет изображения</text></svg>',
    )
  );
}

export function resolveMediaUrl(key: string): string {
  if (!key?.trim()) return fallbackImageUrl();
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/") ||
    key.startsWith("blob:") ||
    key.startsWith("data:")
  ) {
    return key;
  }
  return `${MINIO_PUBLIC_BASE}/${key.replace(/^\//, "")}`;
}

export async function listStrategies(params?: { title?: string }): Promise<ShardingStrategyJSON[]> {
  try {
    const r = await strategiesAxios.get<ShardingStrategyJSON[]>("/strategies", {
      params: params?.title ? { Title: params.title } : undefined,
      headers: { Accept: "application/json" },
    });
    return r.data ?? [];
  } catch {
    return [];
  }
}

export async function getStrategy(id: number): Promise<ShardingStrategyJSON | null> {
  try {
    const r = await strategiesAxios.get<ShardingStrategyJSON>(`/strategies/${id}`, {
      headers: { Accept: "application/json" },
    });
    return r.data ?? null;
  } catch {
    return null;
  }
}
