import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/rentals/'; // Adjust based on your actual API URL

export const getRental = (rentalId) => {
    return axios.get(`${API_URL}${rentalId}`, {
        withCredentials: true
    });
};
export const getRentals = async (params) => {
    try {
        const response = await axios.get(`${API_URL}`, {
            params: params,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all rentals:', error);
        throw error;
    }
};
export const updateRental = async (rent, id) => {
    try {
        const response = await axios.put(`${API_URL}${id}`, rent, {
            withCredentials: true
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating rental:', error);
        throw error;
    }
};
export const deleteRental = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}${id}`, {
            withCredentials: true
        });
        return response;
    } catch (error) {
        console.error('Error updating rental:', error);
        throw error;
    }
};
export const addRental = async (rental) => {
    try {
        const response = await axios.post(`${API_URL}`, rental, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error adding rental:', error);
        throw error;
    }
};