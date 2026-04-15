import type { ShardingStrategyJSON } from "../../modules/strategiesApi";
import StrategyCard from "../StrategyCard/StrategyCard";
import "./StrategiesList.css";

export default function StrategiesList({ strategies }: { strategies: ShardingStrategyJSON[] }) {
  return (
    <div className="container">
      {strategies.map((strategy) => (
        <StrategyCard key={strategy.strategy_id} strategy={strategy} />
      ))}
    </div>
  );
}
