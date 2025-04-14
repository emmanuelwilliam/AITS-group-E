import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Define public routes that don't need authentication
const publicRoutes = [
    'register/student/',
    'register/lecturer/',
    'token/'
];

api.interceptors.request.use(config => {
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
    
    if (!isPublicRoute) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;