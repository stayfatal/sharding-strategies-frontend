import cartIcon from "../../assets/system-load.svg";
import "./CartRow.css";

export default function CartRow() {
  const inner = (
    <>
      <img src={cartIcon} alt="" className="cart-row__icon" aria-hidden />
      <span className="cart-row__text">Стратегий в заявке: 0</span>
    </>
  );

  /*
  if (cart.has_draft && cart.strategies_count > 0 && cart.id != null) {
    return (
      <div className="cart-row">
        <Link to={`/system_load/${cart.id}`} className="cart-row__link">
          {inner}
        </Link>
      </div>
    );
  }
  */

  return (
    <div className="cart-row">
      <div className="cart-row__inactive">{inner}</div>
    </div>
  );
}
