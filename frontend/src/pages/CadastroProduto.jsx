import React, { useState } from 'react';
import api from '../services/api.js';
import Header from '../components/Header'; 

const CadastroProduto = () => {
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
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
            const response = await api.post('/produtos', formData); // Rota de cadastro no backend
            setMessage('Produto cadastrado com sucesso!');
            setFormData({
                nome: '',
                descricao: '',
                preco: '',
                quantidade: '',
            });
        } catch (err) {
            setError('Falha ao cadastrar o produto. Verifique os dados e tente novamente.');
            console.error('Erro ao cadastrar produto:', err);
        }
    };

    return (
        <>
            <Header /> {/* Adicione o Header aqui para a navegação */}
            <div className="cadastro-container">
                <form className="cadastro-form" onSubmit={handleSubmit}>
                    <h2>Cadastrar Produto</h2>
                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="descricao">Descrição</label>
                        <textarea
                            id="descricao"
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="preco">Preço</label>
                        <input
                            type="number"
                            id="preco"
                            name="preco"
                            value={formData.preco}
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
                    <button type="submit" className="cadastro-button">Cadastrar</button>
                </form>
            </div>
        </>
    );
};

export default CadastroProduto;