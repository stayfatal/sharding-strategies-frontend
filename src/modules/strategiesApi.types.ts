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
