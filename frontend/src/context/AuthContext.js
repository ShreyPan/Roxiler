import { createElement, createContext, useContext, useState } from 'react';

const decodeToken = (token) => {
    try {
        if (!token) {
            return null;
        }

        return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
        return null;
    }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const storedToken = localStorage.getItem('token');
    const storedUser = decodeToken(storedToken);

    const [user, setUser] = useState(storedUser);
    const [token, setToken] = useState(storedUser ? storedToken : null);

    const login = (nextToken) => {
        const decoded = decodeToken(nextToken);

        if (!decoded) {
            return;
        }

        localStorage.setItem('token', nextToken);
        setToken(nextToken);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return createElement(AuthContext.Provider, { value: { user, token, login, logout } }, children);
};

export const useAuth = () => useContext(AuthContext);