import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

// Layouts e Páginas
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CadastroUsuario from './pages/CadastroUsuario';
import Dashboard from './pages/Dashboard';
import ListaEstoque from './pages/ListaEstoque';
import CadastroProduto from './pages/CadastroProduto';
import RegistroVenda from './pages/RegistroVenda';
import Relatorios from './pages/Relatorios';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* NENHUM <Header /> ou <NavBar /> AQUI FORA */}
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rotas Protegidas que usarão o MainLayout com Sidebar */}
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/estoque" element={<ListaEstoque />} />
            <Route path="/cadastro" element={<CadastroProduto />} />
            <Route path="/venda" element={<RegistroVenda />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;