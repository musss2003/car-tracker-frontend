import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getUser = async (userId) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}users/${userId}`, {
            method: 'GET',
            credentials: 'include', // Include credentials to send cookies
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching user: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error(`Error fetching user: ${error.message}`);
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