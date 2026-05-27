import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api";
import type {
  WebBackendInternalAppSerializerShardingStrategyJSON,
  WebBackendInternalAppSerializerSystemLoadJSON,
  WebBackendInternalAppSerializerSystemLoadStrategyJSON,
} from "../../api/Api";
import type {
  ShardingStrategyJSON,
  SystemLoadDetailResponse,
  SystemLoadJSON,
} from "../../modules/strategiesApi";
import { apiErrMessage } from "../utils/apiError";
import { clearSession } from "./userSlice";

function mapShardingStrategy(
  s: WebBackendInternalAppSerializerShardingStrategyJSON,
): ShardingStrategyJSON {
  return {
    strategy_id: Number(s.strategy_id ?? 0),
    title: s.title ?? "",
    description: s.description ?? "",
    is_deleted: Boolean(s.is_deleted),
    photo_url: s.photo_url ?? "",
    video: s.video ?? "",
    latency_coefficient: Number(s.latency_coefficient ?? 0),
    throughput_coefficient: Number(s.throughput_coefficient ?? 0),
    reliability_coefficient: Number(s.reliability_coefficient ?? 0),
    short_description_en: s.short_description_en,
  };
}

function mapSystemLoadRow(sl: WebBackendInternalAppSerializerSystemLoadJSON): SystemLoadJSON {
  return {
    system_load_id: Number(sl.system_load_id ?? 0),
    status: sl.status ?? "",
    created_at: sl.created_at != null ? String(sl.created_at) : "",
    creator_login: sl.creator_login ?? "",
    moderator_login: sl.moderator_login,
    forming_date: sl.forming_date,
    finish_date: sl.finish_date,
    description: sl.description,
    completed_item_count: Number(sl.completed_item_count ?? 0),
  };
}

function asDetail(data: unknown): SystemLoadDetailResponse | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const slRaw = o.system_load;
  const strategiesRaw = o.strategies;
  if (!slRaw || typeof slRaw !== "object" || !Array.isArray(strategiesRaw)) return null;
  const sl = mapSystemLoadRow(slRaw as WebBackendInternalAppSerializerSystemLoadJSON);
  const strategies = strategiesRaw.map((row) => {
    const r = row as Record<string, unknown>;
    const st = r.strategy as WebBackendInternalAppSerializerShardingStrategyJSON;
    return {
      system_load_id: Number(r.system_load_id ?? sl.system_load_id),
      strategy_id: Number(r.strategy_id ?? 0),
      data_volume: Number(r.data_volume ?? 0),
      query_count: Number(r.query_count ?? 0),
      response_time:
        r.response_time === null || r.response_time === undefined
          ? null
          : Number(r.response_time),
      strategy: mapShardingStrategy(st ?? {}),
    };
  });
  return { system_load: sl, strategies };
}

function defaultListFilters() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return { fromDate: day, toDate: day, status: "", creatorLogin: "" };
}

function buildInitialState() {
  return {
    cart: null as {
      has_draft: boolean;
      strategies_count: number;
      id?: number;
    } | null,
    cartLoading: false,
    detail: null as SystemLoadDetailResponse | null,
    detailLoading: false,
    detailError: null as string | null,
    list: [] as SystemLoadJSON[],
    listLoading: false,
    listError: null as string | null,
    filters: defaultListFilters(),
    itemMutationLoading: {} as Record<string, boolean>,
    applicationMutationLoading: false,
  };
}

type CartSliceUser = { user: { isAuthenticated: boolean } };

function emptyGuestCartPayload() {
  return {
    has_draft: false,
    strategies_count: 0,
    id: undefined as number | undefined,
  };
}

function axiosStatus(e: unknown): number | undefined {
  if (e && typeof e === "object" && "response" in e) {
    const r = (e as { response?: { status?: number } }).response;
    return r?.status;
  }
  return undefined;
}

export const fetchSystemLoadApplicationCart = createAsyncThunk(
  "systemLoadApplication/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const before = getState() as CartSliceUser;
    if (!before.user.isAuthenticated) {
      return emptyGuestCartPayload();
    }
    try {
      const r = await api.systemLoadApplication.systemLoadApplicationCartList();
      const after = getState() as CartSliceUser;
      if (!after.user.isAuthenticated) {
        return emptyGuestCartPayload();
      }
      const d = r.data as Record<string, unknown>;
      return {
        has_draft: Boolean(d.has_draft),
        strategies_count: Number(d.strategies_count ?? 0),
        id: typeof d.id === "number" ? d.id : undefined,
      };
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchSystemLoadApplicationDetail = createAsyncThunk(
  "systemLoadApplication/fetchDetail",
  async (applicationId: number, { rejectWithValue }) => {
    try {
      const r = await api.systemLoadApplication.systemLoadApplicationDetail(applicationId);
      const detail = asDetail(r.data);
      if (!detail) return rejectWithValue("Неверный ответ сервера");
      return detail;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const addStrategyToSystemLoadApplication = createAsyncThunk(
  "systemLoadApplication/addStrategyLine",
  async (strategyId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.systemLoadStrategyBinding.addStrategyToSystemLoadDraft(strategyId);
      await dispatch(fetchSystemLoadApplicationCart());
      return strategyId;
    } catch (e) {
      if (axiosStatus(e) === 409) {
        await dispatch(fetchSystemLoadApplicationCart());
        return strategyId;
      }
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const updateSystemLoadStrategyLine = createAsyncThunk(
  "systemLoadApplication/updateStrategyLine",
  async (
    {
      strategyId,
      systemLoadId,
      body,
    }: {
      strategyId: number;
      systemLoadId: number;
      body: WebBackendInternalAppSerializerSystemLoadStrategyJSON;
    },
    { rejectWithValue, dispatch },
  ) => {
    const key = `${strategyId}-${systemLoadId}`;
    try {
      await api.systemLoadStrategyBinding.updateSystemLoadStrategyLine(
        strategyId,
        systemLoadId,
        body,
      );
      await dispatch(fetchSystemLoadApplicationDetail(systemLoadId));
      return key;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const removeSystemLoadStrategyLine = createAsyncThunk(
  "systemLoadApplication/removeStrategyLine",
  async (
    { strategyId, systemLoadId }: { strategyId: number; systemLoadId: number },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.systemLoadStrategyBinding.deleteSystemLoadStrategyLine(strategyId, systemLoadId);
      await dispatch(fetchSystemLoadApplicationDetail(systemLoadId));
      await dispatch(fetchSystemLoadApplicationCart());
      return strategyId;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const updateSystemLoadApplicationDraft = createAsyncThunk(
  "systemLoadApplication/updateApplicationDraft",
  async (
    {
      applicationId,
      body,
    }: { applicationId: number; body: WebBackendInternalAppSerializerSystemLoadJSON },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.systemLoadApplication.editSystemLoadApplicationUpdate(applicationId, body);
      await dispatch(fetchSystemLoadApplicationDetail(applicationId));
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const formSystemLoadApplication = createAsyncThunk(
  "systemLoadApplication/form",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.systemLoadApplication.formSystemLoadApplicationUpdate(applicationId);
      await dispatch(fetchSystemLoadApplicationDetail(applicationId));
      await dispatch(fetchSystemLoadApplicationCart());
      await dispatch(fetchSystemLoadApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const deleteSystemLoadApplication = createAsyncThunk(
  "systemLoadApplication/deleteApplication",
  async (applicationId: number, { rejectWithValue, dispatch }) => {
    try {
      await api.systemLoadApplication.deleteSystemLoadApplicationDelete(applicationId);
      await dispatch(fetchSystemLoadApplicationCart());
      await dispatch(fetchSystemLoadApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const finishSystemLoadApplication = createAsyncThunk(
  "systemLoadApplication/finish",
  async (
    { applicationId, status }: { applicationId: number; status: "completed" | "rejected" },
    { rejectWithValue, dispatch },
  ) => {
    try {
      await api.systemLoadApplication.finishSystemLoadApplicationUpdate(applicationId, {
        status,
      });
      await dispatch(fetchSystemLoadApplicationsList());
      return true;
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

export const fetchSystemLoadApplicationsList = createAsyncThunk(
  "systemLoadApplication/fetchList",
  async (_, { getState, rejectWithValue }) => {
    try {
      const st = getState() as {
        systemLoadApplication: { filters: ReturnType<typeof defaultListFilters> };
      };
      const f = st.systemLoadApplication.filters;
      const query: { "from-date"?: string; "to-date"?: string; status?: string } = {};
      if (f.fromDate) query["from-date"] = f.fromDate;
      if (f.toDate) query["to-date"] = f.toDate;
      if (f.status) query.status = f.status;
      const r = await api.systemLoadApplication.allSystemLoadApplicationsList(query);
      return (r.data ?? []).map(mapSystemLoadRow);
    } catch (e) {
      return rejectWithValue(apiErrMessage(e));
    }
  },
);

const systemLoadApplicationSlice = createSlice({
  name: "systemLoadApplication",
  initialState: buildInitialState(),
  reducers: {
    clearSystemLoadApplicationDetailError: (state) => {
      state.detailError = null;
    },
    setListFilters: (
      state,
      action: PayloadAction<Partial<ReturnType<typeof defaultListFilters>>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetListFiltersToToday: (state) => {
      state.filters = defaultListFilters();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clearSession, () => buildInitialState())
      .addCase(fetchSystemLoadApplicationCart.pending, (state) => {
        state.cartLoading = true;
      })
      .addCase(fetchSystemLoadApplicationCart.fulfilled, (state, action) => {
        state.cartLoading = false;
        if (
          typeof action.payload === "object" &&
          action.payload &&
          "strategies_count" in action.payload
        ) {
          state.cart = action.payload as typeof state.cart;
        }
      })
      .addCase(fetchSystemLoadApplicationCart.rejected, (state) => {
        state.cartLoading = false;
        state.cart = {
          has_draft: false,
          strategies_count: 0,
        };
      })
      .addCase(fetchSystemLoadApplicationDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detail = null;
      })
      .addCase(fetchSystemLoadApplicationDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detail = action.payload;
      })
      .addCase(fetchSystemLoadApplicationDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload as string;
      })
      .addCase(fetchSystemLoadApplicationsList.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchSystemLoadApplicationsList.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchSystemLoadApplicationsList.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload as string;
      })
      .addCase(addStrategyToSystemLoadApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(addStrategyToSystemLoadApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(addStrategyToSystemLoadApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(updateSystemLoadApplicationDraft.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(updateSystemLoadApplicationDraft.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(updateSystemLoadApplicationDraft.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(formSystemLoadApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(formSystemLoadApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(formSystemLoadApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(deleteSystemLoadApplication.pending, (state) => {
        state.applicationMutationLoading = true;
      })
      .addCase(deleteSystemLoadApplication.fulfilled, (state) => {
        state.applicationMutationLoading = false;
        state.detail = null;
      })
      .addCase(deleteSystemLoadApplication.rejected, (state) => {
        state.applicationMutationLoading = false;
      })
      .addCase(updateSystemLoadStrategyLine.pending, (state, action) => {
        const k = `${action.meta.arg.strategyId}-${action.meta.arg.systemLoadId}`;
        state.itemMutationLoading[`line-${k}`] = true;
      })
      .addCase(updateSystemLoadStrategyLine.fulfilled, (state, action) => {
        delete state.itemMutationLoading[`line-${action.payload}`];
      })
      .addCase(updateSystemLoadStrategyLine.rejected, (state, action) => {
        const id = action.meta?.arg;
        if (id)
          delete state.itemMutationLoading[`line-${id.strategyId}-${id.systemLoadId}`];
      })
      .addCase(removeSystemLoadStrategyLine.pending, (state, action) => {
        const id = action.meta.arg.strategyId;
        state.itemMutationLoading[`rm-${id}`] = true;
      })
      .addCase(removeSystemLoadStrategyLine.fulfilled, (state, action) => {
        const id = action.payload;
        delete state.itemMutationLoading[`rm-${id}`];
      })
      .addCase(removeSystemLoadStrategyLine.rejected, (state, action) => {
        const id = action.meta?.arg?.strategyId;
        if (id != null) delete state.itemMutationLoading[`rm-${id}`];
      })
      .addCase(finishSystemLoadApplication.pending, (state, action) => {
        const id = action.meta.arg.applicationId;
        state.itemMutationLoading[`finish-${id}`] = true;
      })
      .addCase(finishSystemLoadApplication.fulfilled, (state, action) => {
        const id = action.meta.arg.applicationId;
        delete state.itemMutationLoading[`finish-${id}`];
      })
      .addCase(finishSystemLoadApplication.rejected, (state, action) => {
        const id = action.meta?.arg?.applicationId;
        if (id != null) delete state.itemMutationLoading[`finish-${id}`];
      });
  },
});

export const {
  clearSystemLoadApplicationDetailError,
  setListFilters,
  resetListFiltersToToday,
} = systemLoadApplicationSlice.actions;
export default systemLoadApplicationSlice.reducer;
