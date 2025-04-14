import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/';

export const registerStudent = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}register/student/`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.tokens) {
            return response.data;
        } else {
            throw new Error('Registration failed. No tokens received.');
        }
    } catch (error) {
        console.error('Registration error:', {
            message: error.response?.data?.error || error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error.response?.data || error;
    }
};