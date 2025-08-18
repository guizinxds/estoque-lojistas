import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header style={{ 
            backgroundColor: '#333', 
            padding: '15px 20px', 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'center',
        }}>
            <nav>
                <Link to="/cadastro" style={{ color: '#fff', textDecoration: 'none', margin: '0 15px', fontWeight: 'bold' }}>Cadastro</Link>
                <Link to="/estoque" style={{ color: '#fff', textDecoration: 'none', margin: '0 15px', fontWeight: 'bold' }}>Estoque</Link>
                <Link to="/venda" style={{ color: '#fff', textDecoration: 'none', margin: '0 15px', fontWeight: 'bold' }}>Venda</Link>
                <Link to="/relatorios" style={{ color: '#fff', textDecoration: 'none', margin: '0 15px', fontWeight: 'bold' }}>Relatórios</Link>
            </nav>
        </header>
    );
};

export default Header;