import api from './apiConfig';

export const login = async (emailOrUsername, password) => {
    try {
        const response = await api.post('token/', {
            username: emailOrUsername, // 'username' used for Django compatibility
            password
        });

        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            return response.data;
        }
        throw new Error('No access token received');
    } catch (error) {
        console.error('Login error:', error);
        throw error.response?.data || error;
    }
};

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