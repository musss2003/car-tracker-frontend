import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/rentals/'; // Adjust based on your actual API URL

export const getRental = (rentalId) => {
    return axios.get(`${API_URL}${rentalId}`, {
        withCredentials: true
    });
};
export const getRentals = async () => {
    try {
        const response = await axios.get(`${API_URL}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all rentals:', error);
        throw error;
    }
};
export const updateRental = async (id, car) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, car, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error updating rental:', error);
        throw error;
    }
};