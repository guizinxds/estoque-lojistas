import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/auth.css';

const CadastroUsuario = () => {
    const [formData, setFormData] = useState({
        email: '',
        senha: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await api.post('/auth/register', formData);
            setMessage('Usuário cadastrado com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Falha ao cadastrar o usuário. Tente novamente.');
            }
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Cadastrar Usuário</h2>
                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
                
                
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        id="senha"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Cadastrar</button>
                <div className="auth-link">
                    Já tem uma conta? <Link to="/login">Faça login aqui.</Link>
                </div>
            </form>
        </div>
    );
};

export default CadastroUsuario;