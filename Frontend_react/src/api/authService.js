import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
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
        const response = await axios.post(`${API_URL}register/lecturer/`, lecturerData);
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
      const response = await axios.post(`${API_URL}login/`, {
        username,
        password
      });
  
      // Save tokens to local storage
      const { access, refresh } = response.data.tokens;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
  
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data || error;
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

