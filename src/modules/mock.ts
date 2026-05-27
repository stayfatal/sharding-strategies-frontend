import type {
  ShardingStrategyJSON,
  SystemLoadCartJSON,
  SystemLoadDetailResponse,
} from "./strategiesApi";

export const MOCK_STRATEGY_PHOTO = "/mock/strategy-cover.png";
export const MOCK_STRATEGY_VIDEO = "/mock/composite_sharding.mp4";

export const STRATEGIES_MOCK: ShardingStrategyJSON[] = [
  {
    strategy_id: 1,
    is_deleted: false,
    title: "Range Sharding",
    description:
      "Разбивка по диапазону ключа. Для временных рядов, логов и быстрых range-запросов.",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 1.8,
    throughput_coefficient: 0.6,
    reliability_coefficient: 0.7,
    short_description_en: "Range shards group neighboring keys and speed up ordered scans for time-series data.",
  },
  {
    strategy_id: 2,
    is_deleted: false,
    title: "Hash Sharding",
    description: "Распределение по хэшу ключа. Равномерная нагрузка, стандарт для OLTP.",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 1.0,
    throughput_coefficient: 1.2,
    reliability_coefficient: 0.9,
    short_description_en: "Hash shards spread keys uniformly, balancing write load across partitions in OLTP systems.",
  },
  {
    strategy_id: 3,
    is_deleted: false,
    title: "Geo Sharding",
    description:
      "Данные рядом с пользователем по географии. Низкая латентность и локализация (GDPR).",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 1.4,
    throughput_coefficient: 0.8,
    reliability_coefficient: 0.85,
    short_description_en: "Geo shards place data near users, reducing latency and supporting regional compliance needs.",
  },
  {
    strategy_id: 4,
    is_deleted: false,
    title: "Directory-Based Sharding",
    description:
      "Каталог «ключ → шард». Максимальная гибкость маршрутизации, мультитенантность.",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 2.2,
    throughput_coefficient: 0.5,
    reliability_coefficient: 0.95,
    short_description_en: "Directory shards map each tenant key to a shard for flexible routing and controlled movement.",
  },
  {
    strategy_id: 5,
    is_deleted: false,
    title: "Composite Sharding",
    description:
      "Гибрид: гео + хэш (или иные комбинации). Глобальные системы с равномерной нагрузкой.",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 1.2,
    throughput_coefficient: 1.0,
    reliability_coefficient: 0.92,
    short_description_en: "Composite shards combine rules like geo plus hash to scale globally with balanced traffic.",
  },
  {
    strategy_id: 6,
    is_deleted: false,
    title: "Dynamic Sharding",
    description:
      "Авто split/merge шардов по нагрузке. Облачные БД, эластичное масштабирование.",
    photo_url: MOCK_STRATEGY_PHOTO,
    video: MOCK_STRATEGY_VIDEO,
    latency_coefficient: 0.8,
    throughput_coefficient: 1.5,
    reliability_coefficient: 0.88,
    short_description_en: "Dynamic shards split and merge automatically as traffic changes to keep cluster usage stable.",
  },
];

export const MOCK_CART: SystemLoadCartJSON = {
  has_draft: true,
  strategies_count: 2,
  id: 1,
};

export function getMockStrategy(id: number): ShardingStrategyJSON | undefined {
  return STRATEGIES_MOCK.find((s) => s.strategy_id === id);
}

export function filterMockStrategiesByTitle(title: string): ShardingStrategyJSON[] {
  const t = title.trim().toLowerCase();
  if (!t) return [...STRATEGIES_MOCK];
  return STRATEGIES_MOCK.filter((s) => s.title.toLowerCase().includes(t));
}

const CART_EVENT = "system-load-cart-updated";

export async function addStrategyToMockSystemLoad(
  strategyId: number,
): Promise<{ ok: true } | { ok: false; message?: string }> {
  void strategyId;
  await new Promise((r) => setTimeout(r, 200));
  window.dispatchEvent(new Event(CART_EVENT));
  return { ok: true };
}

export function subscribeSystemLoadCart(listener: () => void): () => void {
  window.addEventListener(CART_EVENT, listener);
  return () => window.removeEventListener(CART_EVENT, listener);
}

export const MOCK_SYSTEM_LOAD_DETAIL: SystemLoadDetailResponse = {
  system_load: {
    system_load_id: 1,
    status: "draft",
    created_at: new Date().toISOString(),
    creator_login: "demo",
    moderator_login: null,
    forming_date: null,
    finish_date: null,
    description: "Черновая заявка на расчёт нагрузки (mock).",
    completed_item_count: 0,
  },
  strategies: [
    {
      system_load_id: 1,
      strategy_id: 1,
      data_volume: 512,
      query_count: 2400,
      response_time: 18.5,
      strategy: STRATEGIES_MOCK[0]!,
    },
    {
      system_load_id: 1,
      strategy_id: 2,
      data_volume: 128,
      query_count: 980,
      response_time: 9.2,
      strategy: STRATEGIES_MOCK[1]!,
    },
  ],
};

export function cloneSystemLoadDetail(src: SystemLoadDetailResponse): SystemLoadDetailResponse {
  return JSON.parse(JSON.stringify(src)) as SystemLoadDetailResponse;
}
