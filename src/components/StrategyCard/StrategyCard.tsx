import { Link } from "react-router-dom";
import { useEffect, useState, type MouseEvent } from "react";
import {
  CART_UPDATED_EVENT,
  fallbackImageUrl,
  resolveMediaUrl,
  type ShardingStrategyJSON,
} from "../../modules/strategiesApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addStrategyToSystemLoadApplication } from "../../store/slices/systemLoadApplicationSlice";
import "./StrategyCard.css";

function photoSrc(photo_url: string, imageError: boolean): string {
  if (imageError || !photo_url?.trim()) return fallbackImageUrl();
  return resolveMediaUrl(photo_url);
}

export default function StrategyCard({ strategy }: { strategy: ShardingStrategyJSON }) {
  const dispatch = useAppDispatch();
  const applicationMutationLoading = useAppSelector(
    (s) => s.systemLoadApplication.applicationMutationLoading,
  );
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);

  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(photoSrc(strategy.photo_url, false));

  useEffect(() => {
    setImageError(false);
    setImageUrl(photoSrc(strategy.photo_url, false));
  }, [strategy.photo_url]);

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(fallbackImageUrl());
  };

  const handleAdd = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      return;
    }
    try {
      await dispatch(addStrategyToSystemLoadApplication(strategy.strategy_id)).unwrap();
      window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    } catch (err) {
      window.alert(String(err));
    }
  };

  const cardClassName = `card${!isAuthenticated ? " card--no-add-btn" : ""}`;

  return (
    <div className="card-wrapper">
      <Link to={`/strategy/${strategy.strategy_id}`} className={cardClassName}>
        <img
          src={imageError ? fallbackImageUrl() : imageUrl}
          alt={strategy.title}
          onError={handleImageError}
        />
        <div className="card__body">
          <h2 className="card__title">{strategy.title}</h2>
          <div className="card__coefficients" aria-label="Коэффициенты стратегии">
            <span className="card__coeff card__coeff--latency" title="Коэффициент задержки">
              {strategy.latency_coefficient.toFixed(1)}
            </span>
            <span className="card__coeff card__coeff--throughput" title="Коэффициент пропускной способности">
              {strategy.throughput_coefficient.toFixed(1)}
            </span>
            <span className="card__coeff card__coeff--reliability" title="Коэффициент надёжности">
              {strategy.reliability_coefficient.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
      {isAuthenticated && (
        <button
          type="button"
          className="card-add-btn"
          onClick={handleAdd}
          disabled={applicationMutationLoading}
        >
          {applicationMutationLoading ? "Добавление…" : "Добавить в заявку"}
        </button>
      )}
    </div>
  );
}
