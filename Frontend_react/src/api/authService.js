// authService.js
import api from './apiConfig';

export const login = async (credentials) => {
  const response = await api.post('login/', credentials); // Changed endpoint
  return {
    ...response.data,
    token: response.data.access, // JWT returns 'access' and 'refresh'
    role: response.data.user?.role // Adjust based on your actual response
  };
};

export const registerStudent = async (studentData) => {
  const response = await api.post('register/student/', studentData); // Changed endpoint
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('user-role/'); // Changed endpoint
  return {
    ...response.data,
    role: response.data.role_name // Adjust based on your UserRoleSerializer
  };
};

export const logout = async () => {
  // Optional: Call Django logout endpoint if you have one
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('token');
};