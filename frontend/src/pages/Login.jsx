import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../assets/css/auth.css';
import { useAuth } from '../context/AuthContext'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            
            localStorage.setItem('companyName', response.data.companyName); 

            login(response.data);

            navigate('/dashboard');

        } catch (err) {
            setError('E-mail ou senha incorretos.');
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleLogin}>
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
                
                <button type="submit" className="auth-button">Entrar</button>

                <div className="auth-link">
                    Não tem uma conta? <Link to="/cadastro-usuario">Cadastre-se aqui.</Link>
                </div>
            </form>
        </div>
    );
};

export default Login;