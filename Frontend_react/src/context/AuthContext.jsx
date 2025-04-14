import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            setError(error.message);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (loginData) => {
        const { token, refresh, user: userData, rememberMe } = loginData;
        
        if (rememberMe) {
            localStorage.setItem('token', token);
            if (refresh) localStorage.setItem('refreshToken', refresh);
        } else {
            sessionStorage.setItem('token', token);
            if (refresh) sessionStorage.setItem('refreshToken', refresh);
        }
        
        setUser(userData);
    };

    const logoutUser = () => {
        logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout: logoutUser,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;