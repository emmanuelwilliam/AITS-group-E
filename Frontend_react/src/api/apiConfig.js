import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Request interceptor: attach access token
api.interceptors.request.use(config => {
  const access = localStorage.getItem('access_token');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Response interceptor: on expired access token, try refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const originalReq = err.config;
    const status = err.response?.status;
    const code   = err.response?.data?.code;

    // If 401 due to expired access token, attempt refresh once
    if (status === 401 && code === 'token_not_valid' && !originalReq._retry) {
      originalReq._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Call the refresh endpoint
          const { data } = await axios.post(
            'http://127.0.0.1:8000/api/token/refresh/',
            { refresh: refreshToken }
          );
          // Save new access token
          localStorage.setItem('access_token', data.access);
          // Update header and retry original request
          originalReq.headers.Authorization = `Bearer ${data.access}`;
          return api(originalReq);
        } catch (refreshErr) {
          // Refresh also failed: force logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(err);
  }
);

export default api;
