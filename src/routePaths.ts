export const ROUTES = {
  STRATEGIES: "/",
  STRATEGY: "/strategy/:id",
  SYSTEM_LOAD: "/system_load/:id",
  SYSTEM_LOADS: "/system_loads",
  SIGN_IN: "/signin",
  SIGN_UP: "/signup",
  PROFILE: "/profile",
} as const;

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: { [key in RouteKeyType]: string } = {
  STRATEGIES: "Каталог стратегий",
  STRATEGY: "Стратегия",
  SYSTEM_LOAD: "Заявка",
  SYSTEM_LOADS: "Заявки",
  SIGN_IN: "Вход",
  SIGN_UP: "Регистрация",
  PROFILE: "Личный кабинет",
};
