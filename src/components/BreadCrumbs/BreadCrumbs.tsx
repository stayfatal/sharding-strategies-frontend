import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { getMockStrategy } from "../../modules/mock";
import { getStrategy } from "../../modules/strategiesApi";
import { ROUTES } from "../../routePaths";
import "./BreadCrumbs.css";

type Crumb = { label: string; to?: string };

export default function BreadCrumbs() {
  const { pathname } = useLocation();
  const [strategyTitle, setStrategyTitle] = useState<string | null>(null);

  useEffect(() => {
    const m = matchPath(ROUTES.STRATEGY, pathname);
    const rawId = m?.params.id;
    if (rawId == null) {
      setStrategyTitle(null);
      return;
    }
    const id = Number(rawId);
    let cancelled = false;
    const run = async () => {
      const data = await getStrategy(id);
      if (cancelled) return;
      if (data?.title) {
        setStrategyTitle(data.title);
        return;
      }
      const s = getMockStrategy(id);
      setStrategyTitle(s?.title ?? `Стратегия ${id}`);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const crumbs: Crumb[] = (() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Главная" }];
    }

    if (pathname === ROUTES.SIGN_IN) {
      return [{ label: "Главная", to: "/" }, { label: "Вход" }];
    }

    if (pathname === ROUTES.SIGN_UP) {
      return [{ label: "Главная", to: "/" }, { label: "Регистрация" }];
    }

    if (pathname === ROUTES.SYSTEM_LOADS) {
      return [{ label: "Главная", to: "/" }, { label: "Заявки" }];
    }

    if (pathname === ROUTES.PROFILE) {
      return [{ label: "Главная", to: "/" }, { label: "Личный кабинет" }];
    }

    const stratMatch = matchPath(ROUTES.STRATEGY, pathname);
    if (stratMatch?.params.id) {
      const title =
        strategyTitle ??
        (stratMatch.params.id ? `Стратегия ${stratMatch.params.id}` : "Стратегия");
      return [{ label: "Главная", to: "/" }, { label: title }];
    }

    const loadMatch = matchPath(ROUTES.SYSTEM_LOAD, pathname);
    if (loadMatch?.params.id) {
      return [
        { label: "Главная", to: "/" },
        { label: `Заявка №${loadMatch.params.id}` },
      ];
    }

    return [{ label: "Главная", to: "/" }, { label: "Страница" }];
  })();

  return (
    <nav className="app-breadcrumbs" aria-label="Навигационная цепочка">
      <ol className="app-breadcrumbs__list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="app-breadcrumbs__item">
              {crumb.to != null && !last ? (
                <Link to={crumb.to} className="app-breadcrumbs__link">
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={last ? "app-breadcrumbs__current" : undefined}
                  aria-current={last ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
