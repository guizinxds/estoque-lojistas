import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api'; // Certifique-se de que o caminho está correto

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpa mensagens de erro anteriores
        try {
            const response = await api.post('/auth/login', { email, password }); // Adapte a rota se necessário
            localStorage.setItem('token', response.data.token);
            navigate('/estoque'); // Redireciona para a página de estoque após o login
        } catch (err) {
            setError('E-mail ou senha incorretos.');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Entrar</h2>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Entrar</button>
            </form>
        </div>
    );
};

export default Login;