import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CadastroProduto from './pages/CadastroProduto';
import ListaEstoque from './pages/ListaEstoque';
import RegistroVenda from './pages/RegistroVenda';
import Relatorios from './pages/Relatorios';
import CadastroUsuario from './pages/CadastroUsuario';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
        
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/cadastro" element={<CadastroProduto />} />
        <Route path="/estoque" element={<ListaEstoque />} />
        <Route path="/venda" element={<RegistroVenda />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;