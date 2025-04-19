import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Base URL for the API
    timeout: 10000, // Add timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true  // If using session/cookies
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error
            return Promise.reject({
                message: 'Network error - Please check if the server is running',
                status: 'error'
            });
        }
        return Promise.reject(error);
    }
);

export default api;