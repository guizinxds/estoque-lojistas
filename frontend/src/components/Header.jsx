import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [companyName, setCompanyName] = useState('');

    useEffect(() => {
        const storedName = localStorage.getItem('companyName');
        if (storedName) {
            setCompanyName(storedName);
        }
    }, []);

    return (
        <header className="header-container">
            <h1>{companyName || 'Meu Sistema de Estoque'}</h1>
            <nav>
                <Link to="/cadastro">Cadastro</Link>
                <Link to="/estoque">Estoque</Link>
                <Link to="/venda">Venda</Link>
                <Link to="/relatorios">Relatórios</Link>
            </nav>
        </header>
    );
};

export default Header;