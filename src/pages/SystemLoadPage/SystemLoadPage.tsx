import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate, useParams } from "react-router-dom";
import { cloneSystemLoadDetail, MOCK_SYSTEM_LOAD_DETAIL } from "../../modules/mock";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type SystemLoadDetailResponse,
  type SystemLoadStrategyDetailJSON,
} from "../../modules/strategiesApi";
import "./SystemLoadPage.css";

export default function SystemLoadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<SystemLoadDetailResponse | null>(null);

  const loadMock = useCallback(() => {
    if (!id) return null;
    const n = Number(id);
    if (n === MOCK_SYSTEM_LOAD_DETAIL.system_load.system_load_id) {
      return cloneSystemLoadDetail(MOCK_SYSTEM_LOAD_DETAIL);
    }
    return null;
  }, [id]);

  useEffect(() => {
    setData(loadMock());
  }, [loadMock]);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Удалить заявку?")) return;
    navigate("/");
  };

  const setLoadDescription = (description: string) => {
    setData((prev) =>
      prev ? { ...prev, system_load: { ...prev.system_load, description } } : prev,
    );
  };

  const updateStrategyRow = (
    strategyId: number,
    patch: Partial<Pick<SystemLoadStrategyDetailJSON, "data_volume" | "query_count" | "response_time">>,
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        strategies: prev.strategies.map((row) =>
          row.strategy_id === strategyId ? { ...row, ...patch } : row,
        ),
      };
    });
  };

  if (!data) {
    return (
      <div className="system-load-page">
        <p className="application-not-found">Заявка не найдена.</p>
      </div>
    );
  }

  const load = data.system_load;

  return (
    <div className="system-load-page">
      <div className="system-load-detail">
        <div className="system-load-detail__header-card">
          <h1 className="system-load-detail__title">Заявка на расчёт нагрузки</h1>
          <div className="system-load-detail__info">
            <div className="system-load-detail__info-item">
              <strong>ID заявки:</strong> {load.system_load_id}
            </div>
            <div className="system-load-detail__info-item">
              <strong>Стратегий в заявке:</strong> {data.strategies.length}
            </div>
          </div>
          <Form.Group className="system-load-page__description" controlId="system-load-description">
            <Form.Label>Описание заявки</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={load.description ?? ""}
              onChange={(e) => setLoadDescription(e.target.value)}
              placeholder="Кратко опишите сценарий нагрузки…"
            />
          </Form.Group>
        </div>

        <table className="load-table">
          <thead>
            <tr>
              <th className="load-table__col-photo">Изображение</th>
              <th>Стратегия</th>
              <th>Данные (ГБ)</th>
              <th>Запросов/сек</th>
              <th>Время отклика (мс)</th>
            </tr>
          </thead>
          <tbody>
            {data.strategies.map((row) => {
              const photo = resolveMediaUrl(row.strategy.photo_url) || fallbackImageUrl();
              return (
                <tr key={`${row.system_load_id}-${row.strategy_id}`}>
                  <td className="load-table__col-photo">
                    <img src={photo} alt={row.strategy.title} />
                  </td>
                  <td>{row.strategy.title}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min={0}
                      className="load-table__input"
                      value={row.data_volume}
                      onChange={(e) =>
                        updateStrategyRow(row.strategy_id, {
                          data_volume: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      min={0}
                      className="load-table__input"
                      value={row.query_count}
                      onChange={(e) =>
                        updateStrategyRow(row.strategy_id, {
                          query_count: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="load-table__col-result">
                    <Form.Control
                      type="number"
                      min={0}
                      step={0.1}
                      className="load-table__input load-table__input--accent"
                      value={row.response_time ?? ""}
                      placeholder="—"
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          updateStrategyRow(row.strategy_id, { response_time: null });
                          return;
                        }
                        const n = Number(v);
                        updateStrategyRow(row.strategy_id, {
                          response_time: Number.isFinite(n) ? n : null,
                        });
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <form className="system-load-page__delete-form" onSubmit={handleDelete}>
          <button type="submit" className="btn-delete">
            Удалить заявку
          </button>
        </form>
      </div>
    </div>
  );
}
