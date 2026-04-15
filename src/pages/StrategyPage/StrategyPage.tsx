import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMockStrategy, STRATEGIES_MOCK } from "../../modules/mock";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type ShardingStrategyJSON,
} from "../../modules/strategiesApi";
import "./StrategyPage.css";

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<ShardingStrategyJSON | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      setStrategy(null);
      return;
    }
    setMediaError(false);
    const resolved =
      getMockStrategy(Number(id)) ?? STRATEGIES_MOCK.find((s) => s.strategy_id === Number(id)) ?? null;
    setStrategy(resolved);
  }, [id]);

  const videoUrl = useMemo(() => (strategy ? resolveMediaUrl(strategy.video) : ""), [strategy]);
  const posterUrl = useMemo(
    () => (strategy ? resolveMediaUrl(strategy.photo_url) || fallbackImageUrl() : fallbackImageUrl()),
    [strategy],
  );
  const showVideo = Boolean(strategy?.video?.trim()) && !mediaError;

  if (!id || !strategy) {
    return (
      <div className="strategy-page strategy-page--scroll">
        <div className="strategy-not-found">
          <h1>Стратегия не найдена</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-page strategy-page--scroll">
      <div className="detail-wrapper">
        <div className="detail-card">
          <div className="detail-card__video-wrap">
            {showVideo ? (
              <video
                className="detail-card__video"
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
              <img className="detail-card__video" src={posterUrl} alt={strategy.title} />
            )}
          </div>
          <div className="detail-card__body">
            <h1 className="detail-card__title">{strategy.title}</h1>
            <div className="detail-card__coefficients">
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
            <p className="detail-card__description">{strategy.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
