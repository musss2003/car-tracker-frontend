import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}users/${userId}`, {
            method: 'GET',
            credentials: 'include', // Include credentials to send cookies
            headers: getAuthHeaders()
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
        const response = await fetch(`${API_URL}users/${userId}`, {
            method: 'PUT',
            credentials: 'include', // Include credentials to send cookies
            headers: getAuthHeaders(),
            body: JSON.stringify(userData) // Send the updated user data
        });

        if (!response.ok) {
            throw new Error(`Error updating user: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error updating user: ${error.message}`);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}users/${userId}`, {
            method: 'DELETE',
            credentials: 'include', // Include credentials to send cookies
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Error deleting user: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error deleting user: ${error.message}`);
        throw error;
    }
};

export const uploadProfilePhoto = async (userId, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);

    try {
        const response = await fetch(`${API_URL}users/${userId}/photo`, {
            method: 'POST',
            credentials: 'include', // Include credentials to send cookies
            headers: {
                ...getAuthHeaders(),
                // 'Content-Type': 'multipart/form-data' // Do not set Content-Type for FormData
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error uploading profile photo: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error uploading profile photo: ${error.message}`);
        throw error;
    }
};