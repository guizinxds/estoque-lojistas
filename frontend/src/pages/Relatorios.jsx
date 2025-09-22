import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../assets/css/relatorio.css';

import { useAuth } from '../context/AuthContext';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.vfs;

const gerarComprovante = (venda, nomeEmpresa) => {
    const docDefinition = {
        content: [
            { text: 'Comprovante de Compra', style: 'header' },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: `Empresa: ${nomeEmpresa}`, margin: [0, 10, 0, 0] },
            { text: `Data da Venda: ${new Date(venda.dataVenda).toLocaleString('pt-BR')}`, margin: [0, 5, 0, 0] },
            { text: `Cliente: ${venda.clienteNome || 'Não informado'}`, margin: [0, 5, 0, 0] },
            { text: `CPF: ${venda.clienteCpf || 'Não informado'}`, margin: [0, 5, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: 'Detalhes da Venda', style: 'subheader', margin: [0, 10, 0, 5] },
            { text: `Produto: ${venda.produto.nome}`, margin: [0, 5, 0, 0] },
            { text: `Quantidade: ${venda.quantidadeVendida}`, margin: [0, 5, 0, 0] },
            { text: `Preço Total: R$ ${venda.precoTotal.toFixed(2)}`, margin: [0, 5, 0, 0] },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },
            { text: 'Obrigado pela sua compra!', style: 'thanks', alignment: 'center', margin: [0, 10, 0, 0] }
        ],
        styles: {
            header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, bold: true },
            thanks: { italics: true }
        }
    };
    pdfMake.createPdf(docDefinition).open();
};

const Relatorios = () => {
    const [maisVendidos, setMaisVendidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const {nomeEmpresa} = useAuth();
    const [cpfBusca, setCpfBusca] = useState('');
    const [vendasPorCpf, setVendasPorCpf] = useState([]);
    const [loadingCpf, setLoadingCpf] = useState(false);
    const [errorCpf, setErrorCpf] = useState('');
    const [buscaRealizada, setBuscaRealizada] = useState(false);

    const handleBuscarPorCpf = async (e) => {
        e.preventDefault();
        setLoadingCpf(true);
        setErrorCpf('');
        setBuscaRealizada(true);
        setVendasPorCpf([]);

        try{
            const cpfSemMacara = cpfBusca.replace(/\D/g, '');
            const response = await api.get(`/api/relatorios/por-cpf/${cpfSemMacara}`);
            setVendasPorCpf(response.data);
        } catch(err){
            setErrorCpf('Ocorreu um erro ao buscar as vendas.');
        } finally{
            setLoadingCpf(false);
        }
    };

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
            <h3>Consultar Venda por Cliente</h3>
            <form onSubmit={handleBuscarPorCpf} style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Digite o CPF do cliente"
                    style={{ flexGrow: 1, padding: '8px' }}
                    value={cpfBusca}
                    onChange={(e) => setCpfBusca(e.target.value)}
                />
                <button type="submit" disabled={loadingCpf} style={{ padding: '8px 16px' }}>
                    {loadingCpf ? 'Buscando...' : 'Buscar'}
                </button>
            </form>
        </div>

         {buscaRealizada && (
            <div className="report-card">
                <h3>Resultados da Busca</h3>
                {loadingCpf && <p>Carregando...</p>}
                {errorCpf && <p className="error-message">{errorCpf}</p>}
                {!loadingCpf && !errorCpf && (
                    vendasPorCpf.length > 0 ? (
                        <table className="relatorio-table">
                            <thead>
                                <tr>
                                    <th>Data da Venda</th>
                                    <th>Cliente</th>
                                    <th>Produto</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendasPorCpf.map((venda) => (
                                    <tr key={venda.id}>
                                        <td>{new Date(venda.dataVenda).toLocaleString('pt-BR')}</td>
                                        <td>{venda.clienteNome}</td>
                                        <td>{venda.produto.nome}</td>
                                        <td>
                                            <button onClick={() => gerarComprovante(venda, nomeEmpresa)}>
                                                Ver Comprovante
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Nenhuma venda encontrada para este CPF.</p>
                    )
                )}
            </div>
        )}
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