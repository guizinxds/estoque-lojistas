import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import Header from '../components/Header';
import '../assets/css/relatorio.css'; 

const Relatorios = () => {
    const [relatoriosData, setRelatoriosData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRelatorios = async () => {
            try {
                setLoading(false);
            } catch (err) {
                setError('Falha ao carregar os relatórios.');
                setLoading(false);
                console.error('Erro ao carregar relatórios:', err);
            }
        };

        fetchRelatorios();
    }, []);

    if (loading) {
        return <p>Carregando relatórios...</p>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <>
            <Header />
            <div className="container">
                <div className="relatorios-header">
                    <h2>Relatórios</h2>
                </div>
                
                <div className="report-card">
                    <h3>Vendas por Período</h3>
                    <p>Aqui você poderá ver um gráfico de vendas ao longo do tempo.</p>
                    <div className="placeholder-chart"></div>
                </div>

                <div className="report-card">
                    <h3>Produtos Mais Vendidos</h3>
                    <p>Lista dos produtos que mais saíram do estoque.</p>
                    <div className="placeholder-list"></div>
                </div>

                <div className="report-card">
                    <h3>Estoque Crítico</h3>
                    <p>Produtos que estão com o estoque baixo e precisam ser reabastecidos.</p>
                    <div className="placeholder-list"></div>
                </div>
            </div>
        </>
    );
};

export default Relatorios;