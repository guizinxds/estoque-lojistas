import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CadastroProduto from "./pages/CadastroProduto";
import ListaEstoque from "./pages/ListaEstoque";
import RegistroVenda from "./pages/RegistroVenda";
import Relatorios from "./pages/Relatorios";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<CadastroProduto />} />
        <Route path="/estoque" element={<ListaEstoque />} />
        <Route path="/venda" element={<RegistroVenda />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </Router>
  );
}

export default App;
