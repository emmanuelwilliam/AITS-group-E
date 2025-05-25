import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:8000/api/';

// 🔓 Axios instance for public (unauthenticated) requests
const publicAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 🔐 Axios instance for protected (authenticated) requests
const privateAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add interceptors to the privateAxios instance
privateAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized! Redirecting to login...');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- AUTHENTICATION: Fix login endpoint to accept both username and email ---
// Instruct users to log in with either username or email (case-insensitive)
// Ensure frontend always sends JSON, not FormData, for login

// 🔧 Auth Service
const authService = {
  // Student Registration (uses publicAxios)
  registerStudent: async (userData) => {
    try {
      const response = await publicAxios.post('register/student/', userData);
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        return response.data;
      }
      throw new Error('Registration failed: No tokens received');
    } catch (error) {
      console.error('Registration error:', {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
      });
      throw error.response?.data || error;
    }
  },   // Add Lecturer Registration
   registerLecturer: async (userData) => {
    try {
      const response = await publicAxios.post('register/lecturer/', userData);
      if (response.data?.success) {
        if (response.data.tokens) {
          localStorage.setItem('access_token', response.data.tokens.access);
          localStorage.setItem('refresh_token', response.data.tokens.refresh);
        }
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Lecturer registration error:', {
        message: error.response?.data || error.message,
        status: error.response?.status,
      });
      throw error;
    }
  },  // Admin Registration (uses publicAxios)
  registerAdmin: async (userData) => {
    try {
      // Validate contact number before sending
      const contactNumber = userData.contact_number;
      if (!contactNumber || !/^07\d{8}$/.test(contactNumber)) {
        throw new Error('Invalid contact number format. Must start with 07 followed by 8 digits.');
      }

      const response = await publicAxios.post('register/administrator/', userData);
      if (response.data?.success) {
        if (response.data.tokens) {
          localStorage.setItem('access_token', response.data.tokens.access);
          localStorage.setItem('refresh_token', response.data.tokens.refresh);
        }
        return response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Administrator registration error:', {
        message: error.response?.data?.error || error.message,
        status: error.response?.status,
      });
      throw error.response?.data || error;
    }
  },

  login: async ({ username, password }) => {
    try {
      const response = await publicAxios.post('login/', { username, password }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('[authService] Login response:', response.data);
      if (response.data?.access && response.data?.refresh) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        console.log('[authService] Set access_token:', response.data.access);
        console.log('[authService] Set refresh_token:', response.data.refresh);
        return response.data;
      }
      throw new Error('Login failed: No tokens received');
    } catch (error) {
      console.error('Login error:', {
        message: error.response?.data?.detail || error.message,
        status: error.response?.status,
      });
      throw error.response?.data || error;
    }
  }, 

  // Token Refresh (uses publicAxios)
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await publicAxios.post('token/refresh/', { 
        refresh: refreshToken 
      });
      
      localStorage.setItem('access_token', response.data.access);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login'; // Add redirect
  },

  // Get Current User (uses privateAxios)
  getCurrentUser: async () => {
    try {
      const response = await privateAxios.get('user/me/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Email Verification (uses publicAxios)
  verifyEmail: async (email, code) => {
    try {
      const response = await publicAxios.post('verify-email/', { email, code });
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', 
        error.response?.data || error.message
      );
      throw error.response?.data || error;
    }
  }
};

export default authService;