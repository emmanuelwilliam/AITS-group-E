import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 // Load current user from backend (only if we have a token)
 const loadUser = useCallback(async () => {
   const token = localStorage.getItem('access_token');
   if (!token) {
     // No token → skip the API hit, just stop loading
     setLoading(false);
     return;
   }

   setLoading(true);
   try {
     const userData = await authService.getCurrentUser();
     setUser(userData);
   } catch (err) {
     // On 401 (or other auth error), wipe stale tokens and redirect
     console.error('Failed to fetch user:', err);
     localStorage.removeItem('access_token');
     localStorage.removeItem('refresh_token');
     window.location.href = '/login';
   } finally {
     setLoading(false);
   }
 }, []);

  // Initial load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login method exposed to components
  const login = useCallback(async ({ username, password, rememberMe }) => {
    setLoading(true);
    try {
      await authService.login({ username, password });
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setError(null);
      return currentUser;
    } catch (err) {
      setError(err.detail || err.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout method
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Show loading state until auth initialized
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
