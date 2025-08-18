import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import '../assets/css/registro-venda.css';

const RegistroVenda = () => {
    const [produtos, setProdutos] = useState([]);
    const [formData, setFormData] = useState({
        produtoId: '',
        quantidade: 1, // Começa com quantidade 1
        precoTotal: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const response = await api.get('/produtos');
                setProdutos(response.data);
                setLoading(false);
            } catch (err) {
                setError('Não foi possível carregar a lista de produtos.');
                setLoading(false);
                console.error('Erro ao buscar produtos:', err);
            }
        };
        fetchProdutos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let newFormData = { ...formData, [name]: value };

        // Lógica para recalcular o preço total
        if (name === 'produtoId' || name === 'quantidade') {
            const selectedProduct = produtos.find(p => p.id === parseInt(newFormData.produtoId));
            const quantidade = parseInt(newFormData.quantidade);
            if (selectedProduct && quantidade > 0) {
                newFormData.precoTotal = (selectedProduct.preco * quantidade).toFixed(2);
            } else {
                newFormData.precoTotal = '';
            }
        }

        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await api.post('/vendas', {
                ...formData,
                quantidade: parseInt(formData.quantidade),
                precoTotal: parseFloat(formData.precoTotal)
            });
            setMessage('Venda registrada com sucesso!');
            setFormData({
                produtoId: '',
                quantidade: 1,
                precoTotal: '',
            });
        } catch (err) {
            setError('Falha ao registrar a venda. Verifique os dados.');
            console.error('Erro ao registrar venda:', err.response?.data?.error || err.message);
        }
    };
    
    if (loading) return <p>Carregando produtos...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            <Header />
            <div className="container">
                <div className="venda-container">
                    <form className="venda-form" onSubmit={handleSubmit}>
                        <h2>Registrar Venda</h2>
                        {message && <p className="success-message">{message}</p>}
                        {error && <p className="error-message">{error}</p>}
                        
                        <div className="form-group">
                            <label htmlFor="produtoId">Produto</label>
                            <select
                                id="produtoId"
                                name="produtoId"
                                value={formData.produtoId}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Selecione um produto</option>
                                {produtos.map(produto => (
                                    <option key={produto.id} value={produto.id}>
                                        {produto.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="quantidade">Quantidade</label>
                            <input
                                type="number"
                                id="quantidade"
                                name="quantidade"
                                value={formData.quantidade}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="precoTotal">Preço Total (R$)</label>
                            <input
                                type="number"
                                id="precoTotal"
                                name="precoTotal"
                                value={formData.precoTotal}
                                onChange={handleChange}
                                step="0.01"
                                readOnly // Impede que o usuário edite o campo
                                required
                            />
                        </div>
                        <button type="submit" className="venda-button">Registrar Venda</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default RegistroVenda;