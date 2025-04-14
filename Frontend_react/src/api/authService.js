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

export const login = async (credentials) => {
  try {
      // First get the JWT token
      const tokenResponse = await api.post('token/', {
          username: credentials.username,
          password: credentials.password
      });

      if (tokenResponse.data.access) {
          // Store the token
          localStorage.setItem('token', tokenResponse.data.access);
          if (tokenResponse.data.refresh) {
              localStorage.setItem('refreshToken', tokenResponse.data.refresh);
          }

          // Get user data with the token
          const userResponse = await api.get('user-role/');
          
          return {
              token: tokenResponse.data.access,
              refresh: tokenResponse.data.refresh,
              user: userResponse.data
          };
      }
      throw new Error('Token not received');
  } catch (error) {
      console.error('Login error:', error);
      throw error.response || error;
  }
};

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