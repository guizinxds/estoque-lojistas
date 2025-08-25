import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // A lógica inicial lê a chave 'user' do localStorage
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    // ESTA É A FUNÇÃO CORRIGIDA
    const login = (userData) => {
        // Garantimos que estamos salvando o objeto userData INTEIRO,
        // que contém tanto o 'token' quanto o 'companyName'.
        // JSON.stringify converte { token: '...', companyName: '...' } em uma string.
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};