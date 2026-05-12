import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchSystemLoadApplicationCart } from "../../store/slices/systemLoadApplicationSlice";
import { subscribeSystemLoadCart } from "../../modules/mock";
import cartIcon from "../../assets/system-load.svg";
import "./CartRow.css";

export default function CartRow({ className = "" }: { className?: string }) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.systemLoadApplication.cart);

  useEffect(() => {
    const sync = () => {
      void dispatch(fetchSystemLoadApplicationCart());
    };
    sync();
    const unsubscribe = subscribeSystemLoadCart(sync);
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const count = cart?.strategies_count ?? 0;
  const hasDraft = Boolean(cart?.has_draft && count > 0 && cart?.id != null);

  const inner = (
    <>
      <img src={cartIcon} alt="" className="cart-row__icon" aria-hidden />
      <span className="cart-row__text">Стратегий в заявке: {count}</span>
    </>
  );

  const rootClass = ["cart-row", className].filter(Boolean).join(" ");

  if (hasDraft && cart?.id != null) {
    return (
      <div className={rootClass}>
        <Link to={`/system_load/${cart.id}`} className="cart-row__link">
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="cart-row__inactive">{inner}</div>
    </div>
  );
}
