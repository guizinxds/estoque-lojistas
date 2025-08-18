import React, { useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import '../assets/css/registro-venda.css';

const RegistroVenda = () => {
    const [formData, setFormData] = useState({
        nomeProduto: '',
        quantidade: '',
        precoTotal: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await api.post('/vendas', formData); // Rota de registro de venda
            setMessage('Venda registrada com sucesso!');
            setFormData({
                nomeProduto: '',
                quantidade: '',
                precoTotal: '',
            });
        } catch (err) {
            setError('Falha ao registrar a venda. Verifique os dados.');
            console.error('Erro ao registrar venda:', err);
        }
    };

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
                            <label htmlFor="nomeProduto">Nome do Produto</label>
                            <input
                                type="text"
                                id="nomeProduto"
                                name="nomeProduto"
                                value={formData.nomeProduto}
                                onChange={handleChange}
                                required
                            />
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