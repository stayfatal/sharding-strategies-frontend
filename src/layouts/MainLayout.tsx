import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader/AppHeader";
import BreadCrumbs from "../components/BreadCrumbs/BreadCrumbs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchSystemLoadApplicationCart } from "../store/slices/systemLoadApplicationSlice";

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated);

  useEffect(() => {
    void dispatch(fetchSystemLoadApplicationCart());
  }, [dispatch, isAuthenticated]);

  return (
    <div className="main-layout">
      <AppHeader />
      <BreadCrumbs />
      <Outlet />
    </div>
  );
}
