import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_CART, subscribeSystemLoadCart } from "../../modules/mock";
import cartIcon from "../../assets/system-load.svg";
import "./CartRow.css";

export default function CartRow() {
  const [cart, setCart] = useState(MOCK_CART);

  useEffect(() => {
    const sync = () => setCart({ ...MOCK_CART });
    sync();
    return subscribeSystemLoadCart(sync);
  }, []);

  const inner = (
    <>
      <img src={cartIcon} alt="" className="cart-row__icon" aria-hidden />
      <span className="cart-row__text">Стратегий в заявке: {cart.strategies_count}</span>
    </>
  );

  if (cart.has_draft && cart.strategies_count > 0 && cart.id != null) {
    return (
      <div className="cart-row">
        <Link to={`/system_load/${cart.id}`} className="cart-row__link">
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-row">
      <div className="cart-row__inactive">{inner}</div>
    </div>
  );
}
