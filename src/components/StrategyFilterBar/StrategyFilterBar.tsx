import type { FormEvent } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./StrategyFilterBar.css";

interface StrategyFilterBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function StrategyFilterBar({ query, onQueryChange, onSearch }: StrategyFilterBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="toolbar strategy-filter-bar">
      <Form onSubmit={handleSubmit} className="search-form strategy-filter-bar__form">
        <Form.Control
          type="text"
          name="query"
          className="search-input"
          placeholder="Поиск стратегий..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <Button type="submit" className="search-btn">
          Найти
        </Button>
      </Form>
    </div>
  );
}
