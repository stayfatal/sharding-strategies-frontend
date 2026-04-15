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

function minioBase(): string {
  const raw = import.meta.env.VITE_MINIO_BASE as string | undefined;
  return raw?.replace(/\/$/, "") ?? "";
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
  const base = minioBase();
  if (base) {
    return `${base}/${key.replace(/^\//, "")}`;
  }
  return fallbackImageUrl();
}

export async function fetchStrategiesByTitle(title?: string): Promise<ShardingStrategyJSON[]> {
  const q = title?.trim() ? `?Title=${encodeURIComponent(title.trim())}` : "";
  const res = await fetch(`/api/strategies${q}`);
  if (!res.ok) {
    throw new Error(`GET /api/strategies failed: ${res.status}`);
  }
  return (await res.json()) as ShardingStrategyJSON[];
}
