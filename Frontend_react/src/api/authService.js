import api from './apiConfig';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerStudent = async (studentData) => {
  const response = await api.post('/auth/register/student', studentData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};