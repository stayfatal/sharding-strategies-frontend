import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import StrategiesPage from "./pages/StrategiesPage/StrategiesPage";
import StrategyPage from "./pages/StrategyPage/StrategyPage";
import SystemLoadPage from "./pages/SystemLoadPage/SystemLoadPage";
import { ROUTES } from "./routePaths";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index_style.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.STRATEGIES} element={<StrategiesPage />} />
          <Route path="/strategies" element={<Navigate to="/" replace />} />
          <Route path={ROUTES.STRATEGY} element={<StrategyPage />} />
          <Route path={ROUTES.SYSTEM_LOAD} element={<SystemLoadPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
