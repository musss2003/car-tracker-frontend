import { getAuthHeaders } from "../utils/getAuthHeaders"; // Ensure this utility function is correctly imported

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/customers/';

export const getCustomer = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}${customerId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the fetched customer data
    } catch (error) {
        console.error('Error fetching customer:', error);
        throw error; // Propagate the error for further handling
    }
};

export const getCustomers = async (params) => {
    try {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}?${query}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the list of customers
    } catch (error) {
        console.error('Error fetching all customers:', error);
        throw error; // Propagate the error for further handling
    }
};

// customerService.js
export const searchCustomersByName = async (name) => {
    try {
        const response = await fetch(`${API_URL}search?name=${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Error searching for customers');
        }

        const customers = await response.json();
        return customers;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};


export const updateCustomer = async (customerId, updatedCustomer) => {
    try {
        const response = await fetch(`${API_URL}${customerId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json', // Specify that the body is JSON
            },
            body: JSON.stringify(updatedCustomer), // Convert the updated customer object to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the updated customer data
    } catch (error) {
        console.error('Error updating customer:', error);
        throw error; // Propagate the error for further handling
    }
};

export const deleteCustomer = async (customerId) => {
    try {
        const response = await fetch(`${API_URL}${customerId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(), // Include authorization headers if needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return; // Simply return if the deletion was successful (no response data)
    } catch (error) {
        console.error('Error deleting customer:', error);
        throw error; // Propagate the error for further handling
    }
};

export const addCustomer = async (newCustomer) => {
    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json', // Specify that the body is JSON
            },
            body: JSON.stringify(newCustomer), // Convert the new customer object to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the added customer data
    } catch (error) {
        console.error('Error adding customer:', error);
        throw error; // Propagate the error for further handling
    }
};
