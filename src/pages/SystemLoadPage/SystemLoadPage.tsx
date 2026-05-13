import { useCallback, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import { cloneSystemLoadDetail, MOCK_SYSTEM_LOAD_DETAIL } from "../../modules/mock";
import {
  fallbackImageUrl,
  resolveMediaUrl,
  type SystemLoadStrategyDetailJSON,
} from "../../modules/strategiesApi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteSystemLoadApplication,
  fetchSystemLoadApplicationDetail,
  formSystemLoadApplication,
  removeSystemLoadStrategyLine,
  updateSystemLoadApplicationDraft,
  updateSystemLoadStrategyLine,
} from "../../store/slices/systemLoadApplicationSlice";
import "./SystemLoadPage.css";

type RowDraft = Pick<SystemLoadStrategyDetailJSON, "data_volume" | "query_count" | "response_time">;

export default function SystemLoadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.user);
  const { detail, detailLoading, detailError, applicationMutationLoading, itemMutationLoading } =
    useAppSelector((s) => s.systemLoadApplication);

  const [mockData, setMockData] = useState<typeof detail>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [rowDrafts, setRowDrafts] = useState<Record<number, RowDraft>>({});

  const reloadMock = useCallback(() => {
    if (!id) return;
    const n = Number(id);
    if (n === MOCK_SYSTEM_LOAD_DETAIL.system_load.system_load_id) {
      setMockData(cloneSystemLoadDetail(MOCK_SYSTEM_LOAD_DETAIL));
    } else {
      setMockData(null);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    setMockData(null);
    void dispatch(fetchSystemLoadApplicationDetail(Number(id))).then((a) => {
      if (fetchSystemLoadApplicationDetail.rejected.match(a)) {
        reloadMock();
      }
    });
  }, [id, isAuthenticated, dispatch, reloadMock]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const data = detail ?? mockData;

  useEffect(() => {
    if (!data) return;
    setDescriptionDraft(data.system_load.description ?? "");
    const next: Record<number, RowDraft> = {};
    data.strategies.forEach((row) => {
      next[row.strategy_id] = {
        data_volume: row.data_volume,
        query_count: row.query_count,
        response_time: row.response_time,
      };
    });
    setRowDrafts(next);
  }, [data]);

  const app = data?.system_load;
  const applicationId = app?.system_load_id;
  const isDraft = app?.status === "draft";
  const busy = applicationMutationLoading || detailLoading;

  const updateRowDraft = useCallback((strategyId: number, patch: Partial<RowDraft>) => {
    setRowDrafts((prev) => {
      const base = prev[strategyId] ?? {
        data_volume: 0,
        query_count: 0,
        response_time: null as number | null,
      };
      return {
        ...prev,
        [strategyId]: { ...base, ...patch },
      };
    });
  }, []);

  const lineBusyKey = (sid: number) =>
    Boolean(itemMutationLoading[`line-${sid}-${applicationId ?? 0}`]);
  const rmBusy = (sid: number) => Boolean(itemMutationLoading[`rm-${sid}`]);

  const handleSaveDescription = () => {
    if (!applicationId || !isDraft || mockData) return;
    void dispatch(
      updateSystemLoadApplicationDraft({
        applicationId,
        body: { description: descriptionDraft || null },
      }),
    );
  };

  const handleSaveRow = (strategyId: number) => {
    if (!applicationId || !isDraft || mockData) return;
    const d = rowDrafts[strategyId];
    if (!d) return;
    void dispatch(
      updateSystemLoadStrategyLine({
        strategyId,
        systemLoadId: applicationId,
        body: {
          system_load_id: applicationId,
          strategy_id: strategyId,
          data_volume: d.data_volume,
          query_count: d.query_count,
          response_time: d.response_time,
        },
      }),
    );
  };

  const handleRemoveRow = (strategyId: number) => {
    if (!applicationId || !isDraft || mockData) return;
    if (!window.confirm("Убрать стратегию из заявки?")) return;
    void dispatch(removeSystemLoadStrategyLine({ strategyId, systemLoadId: applicationId }));
  };

  const handleForm = () => {
    if (!applicationId || !isDraft || mockData) return;
    void dispatch(formSystemLoadApplication(applicationId));
  };

  const handleDeleteApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !isDraft) return;
    if (!window.confirm("Удалить заявку?")) return;
    if (mockData) {
      navigate("/", { replace: true });
      return;
    }
    void dispatch(deleteSystemLoadApplication(applicationId)).then(() => {
      navigate("/", { replace: true });
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (detailLoading && !data) {
    return (
      <div className="system-load-page">
        <div className="strategies-page__loading">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (!data || !app || applicationId == null) {
    return (
      <div className="system-load-page">
        <p className="application-not-found">
          {detailError ? detailError : "Заявка не найдена."}
        </p>
      </div>
    );
  }

  return (
    <div className="system-load-page">
      {busy ? (
        <div className="system-load-page__blocking" aria-live="polite">
          <Spinner animation="border" size="sm" /> Обработка…
        </div>
      ) : null}
      <div className={`system-load-detail ${busy ? "system-load-detail--blocked" : ""}`}>
        <div className="system-load-detail__header-card">
          <h1 className="system-load-detail__title">Заявка на расчёт нагрузки</h1>
          <div className="system-load-detail__info">
            <div className="system-load-detail__info-item">
              <strong>ID заявки:</strong> {applicationId}
            </div>
            <div className="system-load-detail__info-item">
              <strong>Статус:</strong> {app.status}
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
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              placeholder="Кратко опишите сценарий нагрузки…"
              disabled={!isDraft || Boolean(mockData)}
            />
          </Form.Group>
          {isDraft && !mockData ? (
            <div className="system-load-page__method-actions">
              <button
                type="button"
                className="system-load-page__method-btn"
                disabled={busy}
                onClick={() => handleSaveDescription()}
              >
                Сохранить описание заявки
              </button>
              <button
                type="button"
                className="system-load-page__method-btn system-load-page__method-btn--accent"
                disabled={busy}
                onClick={() => handleForm()}
              >
                Сформировать заявку
              </button>
            </div>
          ) : null}
        </div>

        <p className="system-load-page__methods-hint">
          Доступны действия с заявкой и её строками: сохранение описания, сохранение строк таблицы,
          удаление строки, формирование и удаление черновика.
        </p>

        <table className="load-table">
          <thead>
            <tr>
              <th className="load-table__col-photo">Изображение</th>
              <th>Стратегия</th>
              <th>Данные (ГБ)</th>
              <th>Запросов/сек</th>
              <th>Время отклика (мс)</th>
              {isDraft ? <th>Действия со строкой (м-м)</th> : null}
            </tr>
          </thead>
          <tbody>
            {data.strategies.map((row) => {
              const photo = resolveMediaUrl(row.strategy.photo_url) || fallbackImageUrl();
              const draft = rowDrafts[row.strategy_id];
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
                      value={draft?.data_volume ?? row.data_volume}
                      disabled={!isDraft}
                      onChange={(e) =>
                        updateRowDraft(row.strategy_id, {
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
                      value={draft?.query_count ?? row.query_count}
                      disabled={!isDraft}
                      onChange={(e) =>
                        updateRowDraft(row.strategy_id, {
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
                      value={
                        draft?.response_time === null || draft?.response_time === undefined
                          ? ""
                          : draft.response_time
                      }
                      placeholder="—"
                      disabled={!isDraft}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          updateRowDraft(row.strategy_id, { response_time: null });
                          return;
                        }
                        const n = Number(v);
                        updateRowDraft(row.strategy_id, {
                          response_time: Number.isFinite(n) ? n : null,
                        });
                      }}
                    />
                  </td>
                  {isDraft ? (
                    <td className="load-table__actions">
                      <button
                        type="button"
                        className="system-load-page__row-btn"
                        disabled={busy || lineBusyKey(row.strategy_id) || Boolean(mockData)}
                        onClick={() => handleSaveRow(row.strategy_id)}
                      >
                        Сохранить строку
                      </button>
                      <button
                        type="button"
                        className="system-load-page__row-btn system-load-page__row-btn--danger"
                        disabled={busy || rmBusy(row.strategy_id) || Boolean(mockData)}
                        onClick={() => handleRemoveRow(row.strategy_id)}
                      >
                        Удалить из заявки
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>

        {isDraft ? (
          <form className="system-load-page__delete-form" onSubmit={handleDeleteApplication}>
            <button type="submit" className="btn-delete" disabled={busy || Boolean(mockData)}>
              Удалить заявку
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
