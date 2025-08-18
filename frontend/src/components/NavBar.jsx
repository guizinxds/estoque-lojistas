import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/cadastro" style={{ margin: "0 10px", color: "#fff" }}>Cadastro</Link>
      <Link to="/estoque" style={{ margin: "0 10px", color: "#fff" }}>Estoque</Link>
      <Link to="/venda" style={{ margin: "0 10px", color: "#fff" }}>Venda</Link>
      <Link to="/relatorios" style={{ margin: "0 10px", color: "#fff" }}>Relatórios</Link>
    </nav>
  );
}
