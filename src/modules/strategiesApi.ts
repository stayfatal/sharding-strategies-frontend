export interface ShardingStrategyJSON {
  strategy_id: number;
  title: string;
  description: string;
  is_deleted: boolean;
  photo_url: string;
  video: string;
  latency_coefficient: number;
  throughput_coefficient: number;
  reliability_coefficient: number;
  short_description_en?: string;
}

export interface SystemLoadCartJSON {
  id?: number;
  has_draft: boolean;
  strategies_count: number;
}

export interface SystemLoadJSON {
  system_load_id: number;
  status: string;
  created_at: string;
  creator_login: string;
  moderator_login?: string | null;
  forming_date?: string | null;
  finish_date?: string | null;
  description?: string | null;
  completed_item_count: number;
}

export interface SystemLoadStrategyDetailJSON {
  system_load_id: number;
  strategy_id: number;
  data_volume: number;
  query_count: number;
  response_time: number | null;
  strategy: ShardingStrategyJSON;
}

export interface SystemLoadDetailResponse {
  system_load: SystemLoadJSON;
  strategies: SystemLoadStrategyDetailJSON[];
}

const MINIO_PUBLIC_BASE =
  (import.meta.env.VITE_MINIO_PUBLIC_BASE?.replace(/\/$/, "") as string | undefined) ??
  "http://localhost:9000/test";

export const CART_UPDATED_EVENT = "system-load-cart-updated";

function strategyTypeHint(titleRaw: string | undefined): string {
  const title = titleRaw?.toLowerCase().trim() ?? "";
  if (title.includes("geo")) {
    return "Type: Geo Sharding (single-rule regional placement by user location).";
  }
  if (title.includes("composite")) {
    return "Type: Composite Sharding (hybrid multi-rule routing, for example geo plus hash).";
  }
  if (title.includes("range")) {
    return "Type: Range Sharding (ordered key ranges, optimized for interval scans).";
  }
  if (title.includes("hash")) {
    return "Type: Hash Sharding (uniform key distribution by hash function).";
  }
  if (title.includes("directory")) {
    return "Type: Directory-Based Sharding (lookup map key-to-shard for flexible routing).";
  }
  if (title.includes("dynamic")) {
    return "Type: Dynamic Sharding (automatic split and merge based on load).";
  }
  return "Type: Database sharding strategy.";
}

export function strategyClipDescription(strategy: ShardingStrategyJSON): string {
  const hint = strategyTypeHint(strategy.title);
  const en = strategy.short_description_en?.trim();
  if (en) return `${hint} ${en}`;

  const title = strategy.title?.trim();
  const description = strategy.description?.trim();

  if (title && description) {
    return `${hint} ${title}. ${description}`;
  }
  if (description) return `${hint} ${description}`;
  if (title) return `${hint} ${title}`;

  return hint;
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

export async function getSystemLoadCart(): Promise<SystemLoadCartJSON> {
  try {
    const res = await fetch("/api/system_loads/cart", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SystemLoadCartJSON;
  } catch {
    return { has_draft: false, strategies_count: 0 };
  }
}

export async function listStrategies(params?: { title?: string }): Promise<ShardingStrategyJSON[]> {
  try {
    let path = "/api/strategies";
    if (params?.title) {
      const q = new URLSearchParams();
      q.append("Title", params.title);
      path += `?${q.toString()}`;
    }
    const res = await fetch(path, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ShardingStrategyJSON[];
  } catch {
    return [];
  }
}

export async function getStrategy(id: number): Promise<ShardingStrategyJSON | null> {
  try {
    const res = await fetch(`/api/strategies/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ShardingStrategyJSON;
  } catch {
    return null;
  }
}

export async function getSystemLoad(id: number): Promise<SystemLoadDetailResponse | null> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`/api/system_loads/${id}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SystemLoadDetailResponse;
  } catch {
    return null;
  }
}

export async function addStrategyToSystemLoad(
  strategyId: number,
): Promise<{ ok: true } | { ok: false; status: number; message?: string }> {
  const token = localStorage.getItem("token");
  if (!token) {
    return { ok: false, status: 401, message: "Войдите в систему, чтобы добавить стратегию в заявку." };
  }
  try {
    const res = await fetch(`/api/system_load_strategies/add/${strategyId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok || res.status === 201) return { ok: true };
    let message: string | undefined;
    try {
      const j = (await res.json()) as { error?: string; message?: string; description?: string };
      message = j.error ?? j.message ?? j.description;
    } catch {
      message = await res.text();
    }
    return { ok: false, status: res.status, message: message || `HTTP ${res.status}` };
  } catch {
    return { ok: false, status: 0, message: "Не удалось выполнить запрос." };
  }
}
