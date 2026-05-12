import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { getMockStrategy, STRATEGIES_MOCK } from "../../modules/mock";
import {
  fallbackImageUrl,
  getStrategy,
  resolveMediaUrl,
  type ShardingStrategyJSON,
} from "../../modules/strategiesApi";
import "./StrategyPage.css";

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<ShardingStrategyJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setMediaError(false);
      try {
        const data = await getStrategy(Number(id));
        const resolved =
          data ?? getMockStrategy(Number(id)) ?? STRATEGIES_MOCK.find((s) => s.strategy_id === Number(id)) ?? null;
        if (!cancelled) {
          setStrategy(resolved);
        }
      } catch {
        const resolved =
          getMockStrategy(Number(id)) ?? STRATEGIES_MOCK.find((s) => s.strategy_id === Number(id)) ?? null;
        if (!cancelled) {
          setStrategy(resolved);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="strategy-page strategy-page--scroll">
        <div className="strategies-page__loading">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!id || !strategy) {
    return (
      <div className="strategy-page strategy-page--scroll">
        <div className="strategy-not-found">
          <h1>Стратегия не найдена</h1>
        </div>
      </div>
    );
  }

  const videoUrl = resolveMediaUrl(strategy.video);
  const posterUrl = resolveMediaUrl(strategy.photo_url) || fallbackImageUrl();
  const showVideo = Boolean(strategy.video?.trim()) && !mediaError;

  return (
    <div className="strategy-page strategy-page--scroll">
      <div className="strategy-video-card">
        <div className="strategy-video-frame">
          {showVideo ? (
            <video
              className="strategy-video-frame__media"
              controls
              autoPlay
              muted
              loop
              playsInline
              poster={posterUrl}
              onError={() => setMediaError(true)}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <img className="strategy-video-frame__media" src={posterUrl} alt={strategy.title} />
          )}
          <div className="strategy-video-frame__shade" />
          <div className="strategy-video-overlay">
            <h1 className="strategy-video-overlay__title">{strategy.title}</h1>
            <div className="strategy-video-overlay__coefficients">
              <span className="detail-card__badge detail-card__badge--latency">
                Задержка: {strategy.latency_coefficient.toFixed(1)}
              </span>
              <span className="detail-card__badge detail-card__badge--throughput">
                Пропускная: {strategy.throughput_coefficient.toFixed(1)}
              </span>
              <span className="detail-card__badge detail-card__badge--reliability">
                Надёжность: {strategy.reliability_coefficient.toFixed(2)}
              </span>
            </div>
            <p className="strategy-video-overlay__description">{strategy.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
