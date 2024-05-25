import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

export const getCustomer = (customerId) => {
    return axios.get(`${API_URL}customers/${customerId}`, {
        withCredentials: true
    });
};

export const getCustomers = async (params) => {
    try {
        const response = await axios.get(`${API_URL}customers`, {
            params: params,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all customers:', error);
        throw error;
    }
};

export const updateCustomer = async (id, customer) => {
    try {
        const response = await axios.put(`${API_URL}customers/${id}`, customer, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error;
    }
};

export const deleteCustomer = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}customers/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error;
    }
};

export const addCustomer = async (newCustomer) => {
    try {
        const response = await axios.post(API_URL + 'customers', newCustomer, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error;
    }
};
