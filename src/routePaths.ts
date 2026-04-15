export const ROUTES = {
  STRATEGIES: "/",
  STRATEGY: "/strategy/:id",
  SYSTEM_LOAD: "/system_load/:id",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  STRATEGIES: "Каталог стратегий",
  STRATEGY: "Стратегия",
  SYSTEM_LOAD: "Заявка",
};
