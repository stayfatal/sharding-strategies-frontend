import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import CartRow from "../../components/CartRow/CartRow";
import StrategiesList from "../../components/StrategiesList/StrategiesList";
import StrategyFilterBar from "../../components/StrategyFilterBar/StrategyFilterBar";
import { STRATEGIES_MOCK, filterMockStrategiesByTitle } from "../../modules/mock";
import type { ShardingStrategyJSON } from "../../modules/strategiesApi";
import "./StrategiesPage.css";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<ShardingStrategyJSON[]>(STRATEGIES_MOCK);
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStrategies(filterMockStrategiesByTitle(""));
  }, []);

  const handleSearch = () => {
    setLoading(true);
    try {
      setStrategies(filterMockStrategiesByTitle(searchTitle));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="strategies-page">
      <StrategyFilterBar query={searchTitle} onQueryChange={setSearchTitle} onSearch={handleSearch} />
      <div className="space">
        <main className="strategies-page__main">
          <CartRow />
          {loading ? (
            <div className="strategies-page__loading">
              <Spinner animation="border" role="status" aria-label="Загрузка">
                <span className="visually-hidden">Загрузка...</span>
              </Spinner>
            </div>
          ) : (
            <div className="strategies-page__grid">
              {strategies.length > 0 ? (
                <StrategiesList strategies={strategies} />
              ) : (
                <div className="strategies-page__empty">
                  {searchTitle.trim()
                    ? `По запросу «${searchTitle}» ничего не найдено`
                    : "Стратегии не найдены"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
