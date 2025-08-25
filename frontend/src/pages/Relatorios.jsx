import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../assets/css/relatorio.css';

const Relatorios = () => {
    const [maisVendidos, setMaisVendidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRelatorios = async () => {
            try {
                const response = await api.get('/api/relatorios/mais-vendidos');
                setMaisVendidos(response.data);
                setLoading(false);
            } catch (err) {
                setError('Falha ao carregar os relatórios.');
                setLoading(false);
                console.error('Erro ao carregar relatórios:', err);
            }
        };

        fetchRelatorios();
    }, []);

    if (loading) return <p>Carregando relatórios...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            
            <div className="container">
                <div className="relatorios-header">
                    <h2>Relatório de Vendas</h2>
                </div>
                
                <div className="report-card">
                    <h3>Produtos Mais Vendidos</h3>
                    {maisVendidos.length > 0 ? (
                        <table className="relatorio-table">
                            <thead>
                                <tr>
                                    <th>Posição</th>
                                    <th>Nome do Produto</th>
                                    <th>Quantidade Total Vendida</th>
                                </tr>
                            </thead>
                            <tbody>
                                {maisVendidos.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.nome}</td>
                                        <td>{item.quantidadeVendida}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Nenhum dado de vendas para exibir.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Relatorios;