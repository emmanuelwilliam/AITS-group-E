import api from './apiConfig';

export const registerStudent = async (studentData) => {
    try {
        const response = await api.post('register/student/', studentData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error.response || error;
    }
};

export const registerLecturer = async (lecturerData) => {
  try {
      const response = await api.post('register/lecturer/', lecturerData);
      console.log('Registration response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Registration error:', error.response?.data);
      throw error;
  }
};


export async function login(credentials) {
    try {
        const response = await api.post('token/', credentials);
        
        if (response.data.access) {
            // Store tokens
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            return response.data;
        }
        throw new Error('Login failed. No token received.');
    } catch (error) {
        console.error('Login error:', error);
        throw error.response?.data || error;
    }
}

export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await api.get('user-role/');
        return response.data;
    } catch (error) {
        throw error.response;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};