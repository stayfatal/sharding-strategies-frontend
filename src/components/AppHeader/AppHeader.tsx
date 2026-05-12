import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/userSlice";
import { ROUTES } from "../../routePaths";
import "./AppHeader.css";

export default function AppHeader() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, username } = useAppSelector((s) => s.user);
  const cart = useAppSelector((s) => s.systemLoadApplication.cart);

  const handleLogout = () => {
    void dispatch(logoutUser());
  };

  const draftActive =
    Boolean(cart?.has_draft && cart.strategies_count > 0 && cart.id != null);

  return (
    <header>
      <Navbar
        expand="lg"
        collapseOnSelect
        variant="dark"
        className="shard-navbar py-0"
        data-bs-theme="dark"
      >
        <Container fluid className="shard-navbar__inner">
          <Navbar.Brand as={Link} to="/" className="header-home mb-0 py-2">
            <span className="header-home__text">ShardDB</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="shard-main-nav" className="shard-navbar__toggle" />
          <Navbar.Collapse id="shard-main-nav">
            <Nav className="ms-auto mb-2 mb-lg-0 shard-navbar__nav" navbar>
              <Nav.Link as={Link} to="/" className="shard-nav-link" eventKey="catalog">
                Каталог стратегий
              </Nav.Link>
              {isAuthenticated ? (
                <>
                  <Nav.Link
                    as={Link}
                    to={ROUTES.SYSTEM_LOADS}
                    className="shard-nav-link"
                    eventKey="loads"
                  >
                    Заявки
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to={ROUTES.PROFILE}
                    className="shard-nav-link"
                    eventKey="profile"
                  >
                    Личный кабинет
                  </Nav.Link>
                </>
              ) : null}
              {draftActive && cart?.id != null ? (
                <Nav.Link
                  as={Link}
                  to={`/system_load/${cart.id}`}
                  className="shard-nav-link"
                  eventKey="draft"
                >
                  Текущая заявка
                </Nav.Link>
              ) : (
                <Nav.Link className="shard-nav-link shard-nav-link--muted" eventKey="draft-off" disabled>
                  Текущая заявка
                </Nav.Link>
              )}
              {isAuthenticated ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/"
                    className="shard-nav-link"
                    eventKey="logout"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                  >
                    Выход
                  </Nav.Link>
                  <span className="shard-navbar__username d-none d-lg-inline">{username}</span>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to={ROUTES.SIGN_IN} className="shard-nav-link" eventKey="signin">
                    Вход
                  </Nav.Link>
                  <Nav.Link as={Link} to={ROUTES.SIGN_UP} className="shard-nav-link" eventKey="signup">
                    Регистрация
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
