import axios from "axios";

const API_URL = 'http://127.0.0.1:8000/api/';

// Create an Axios instance
const api = axios.create({
    baseURL: API_URL,
  });
  
  // Add a request interceptor to include the access token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

export const registerStudent = async (studentData) => {
    try {
        const response = await api.post('register/student/', studentData);
        console.log('Registration success:', response.data);
        
        if (response.data.success) {
            // Don't store token yet - wait for email verification
            return {
                success: true,
                email: response.data.user.email,
                tokens: response.data.tokens, //store these tokens temporarily
                message: response.data.message,
            };
        }
        throw new Error(response.data.error || 'Registration failed');
    } catch (error) {
        console.error('Registration error:', error);
        throw {
            message: error.message || 'Registration failed',
            status: error.response?.status,
            details: error.response?.data
        };
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

export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return { authenticated: false };
        }
        const response = await api.get('user-role/');
        return {
            authenticated: true,
            ...response.data
        };
    } catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
        return { authenticated: false };
    }
};