import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import CadastroProduto from './pages/CadastroProduto';
import ListaEstoque from './pages/ListaEstoque';
import RegistroVenda from './pages/RegistroVenda';

import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      {/* NavBar aparecerá em todas as páginas */}
      <NavBar /> 

      <div className="container">
        <Routes>
          {/* Defina a rota padrão para a lista de estoque */}
          <Route path="/" element={<ListaEstoque />} />
          <Route path="/estoque" element={<ListaEstoque />} />
          <Route path="/cadastrar-produto" element={<CadastroProduto />} />
          <Route path="/registrar-venda" element={<RegistroVenda />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;