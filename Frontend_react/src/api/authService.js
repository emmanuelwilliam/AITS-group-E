import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

// Create an Axios instance for API requests
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for CSRF token to be sent
});

// Auto-attach JWT
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Registration: flat payload, hit the correct endpoint
export const registerStudent = async (data) => {
    try {
      return (await api.post('register/student/', data)).data;
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      throw err;
    }
  };

export const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return { authenticated: false };
  try {
    const { data } = await api.get('user-role/');
    return { authenticated: true, ...data };
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return { authenticated: false };
  }
};

export const registerLecturer = async (lecturerData) => {
    try {
        const response = await axios.post(`${API_URL}register/Lecturer/`, lecturerData);
        console.log('Lecturer registration success:', response.data);

        if (response.data.success) {
            return {
                success: true,
                user: response.data.user,
                tokens: response.data.tokens,
                message: response.data.message,
            };
        }

        throw new Error(response.data.error || 'Lecturer registration failed');
    } catch (error) {
        console.error('Lecturer registration error:', error);
        throw {
            message: error.message || 'Lecturer registration failed',
            status: error.response?.status,
            details: error.response?.data
        };
    }
};

export const registerAdministrator = async (adminData) => {
    try {
        const response = await axios.post(`${API_URL}register/administrator/`, adminData);
        console.log('Admin registration success:', response.data);

        if (response.data.success) {
            return {
                success: true,
                user: response.data.user,
                tokens: response.data.tokens,
                message: response.data.message,
            };
        }

        throw new Error(response.data.error || 'Administrator registration failed');
    } catch (error) {
        console.error('Administrator registration error:', error);
        throw {
            message: error.message || 'Administrator registration failed',
            status: error.response?.status,
            details: error.response?.data
        };
    }
};


export const login = async ({ username, password }) => {
  try {
    // 🔍 1) Log exactly what you send
    console.log('→ POST /api/login/ payload:', { username, password });

    // 2) Hit the correct endpoint
    const { data } = await axios.post(
      `${API_URL}login/`,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // 🔑 3) SimpleJWT returns a flat { access, refresh }
    console.log('← 200 OK, tokens:', data);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    return data;
  } catch (err) {
    // Normalize the error so you see exactly what came back
    const payload = err.response?.data || err.message || err;
    console.error('← Login error payload:', payload);
    throw payload;
  }
};

export const verifyEmail = async (email, code) => {
    try {
        console.log("Sending verification request for:", email);
        const response = await api.post('verify-email/', { email, code });
        console.log("Verification response:", response.data);
        if (response.data.success) {
            return {
                success: true,
                tokens: response.data.tokens
            };
        }
        throw new Error(response.data.error || 'Verification failed');
    } catch (error) {
        console.error("Full verification error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

