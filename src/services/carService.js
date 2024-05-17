// services/carService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getCar = (carId) => {
    return axios.get(`${API_URL}cars/${carId}`, {
        withCredentials: true
    });
};
export const getCars = async () => {
    try {
        const response = await axios.get(`${API_URL}cars`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all cars:', error);
        throw error;
    }
};
export const updateCar = async (id, car) => {
    try {
        const response = await axios.put(`${API_URL}cars/${id}`, car, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error updating car:', error);
        throw error;
    }
};
export const deleteCar = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}cars/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting car:', error);
        throw error;
    }
};

export const addCar = async (car) => {
    try {
        const response = await axios.post(`${API_URL}cars`, car, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error adding car:', error);
        throw error;
    }
};