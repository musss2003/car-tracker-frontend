// services/userService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getUser = (userId) => {
    return axios.get(`${API_URL}users/${userId}`);
};

export const getUserDetails = (userId) => {
    return axios.get(`${API_URL}users/details/${userId}`);
};

export const updateUser = (userId, userData) => {
    return axios.put(`${API_URL}users/${userId}`, userData);
};

export const updateUserDetails = (userId, userData) => {
    return axios.put(`${API_URL}users/details/${userId}`, userData);
};


export const deleteUser = (userId) => {
    return axios.delete(`${API_URL}users/${userId}`);
};
