import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getUser = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}users/${userId}`, {
            withCredentials: true // Include credentials to send cookies
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching user: ${error.response?.statusText || error.message}`);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}users/${userId}`, userData, {
            withCredentials: true, // Include credentials to send cookies
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating user: ${error.response?.statusText || error.message}`);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}users/${userId}`, {
            withCredentials: true // Include credentials to send cookies
        });
        return response.data;
    } catch (error) {
        console.error(`Error deleting user: ${error.response?.statusText || error.message}`);
        throw error;
    }
};