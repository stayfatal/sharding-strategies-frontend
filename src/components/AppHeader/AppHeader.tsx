import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { MOCK_CART } from "../../modules/mock";
import "./AppHeader.css";

export default function AppHeader() {
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
              {MOCK_CART.has_draft && MOCK_CART.id != null ? (
                <Nav.Link
                  as={Link}
                  to={`/system_load/${MOCK_CART.id}`}
                  className="shard-nav-link"
                  eventKey="draft"
                >
                  Текущая заявка
                </Nav.Link>
              ) : null}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
