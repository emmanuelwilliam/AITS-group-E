import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../api/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUser = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.authenticated) {
                setUser(userData);
            } else {
                setUser(null);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load user data');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, error, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);