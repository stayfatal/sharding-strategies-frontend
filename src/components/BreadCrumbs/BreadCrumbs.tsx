import { useEffect, useState } from "react";
import { Link, matchPath, useLocation } from "react-router-dom";
import { getMockStrategy } from "../../modules/mock";
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
    const s = getMockStrategy(id);
    setStrategyTitle(s?.title ?? `Стратегия ${id}`);
  }, [pathname]);

  const crumbs: Crumb[] = (() => {
    if (pathname === "/" || pathname === "") {
      return [{ label: "Главная" }];
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
      return [{ label: "Главная", to: "/" }, { label: `Заявка №${loadMatch.params.id}` }];
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
