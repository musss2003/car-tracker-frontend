import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/contracts/';

export const getContracts = async () => {
    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const getContractsPopulated = async () => {
    try {
        const response = await fetch(`${API_URL}populated`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching contracts:', error);
        throw error;
    }
};

export const getActiveContracts = async () => {
    try {
        const response = await fetch(`${API_URL}/active`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching active contracts:', error);
        throw error;
    }
};

export const updateContract = async (contractId, updatedContract) => {
    try {
        const response = await fetch(`${API_URL}/contracts/${contractId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json', // Specify that the body is JSON
            },
            body: JSON.stringify(updatedContract), // Convert the updated contract object to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the updated contract data
    } catch (error) {
        console.error('Error updating contract:', error);
        throw error; // Propagate the error for further handling
    }
};

export const deleteContract = async (contractId) => {
    try {
        const response = await fetch(`${API_URL}/contracts/${contractId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(), // Include authorization headers if needed
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return; // Simply return if the deletion was successful (no response data)
    } catch (error) {
        console.error('Error deleting contract:', error);
        throw error; // Propagate the error for further handling
    }
};


export const createContract = async (contractData) => {
    try {
        const response = await fetch(`${API_URL}/contracts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(contractData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating contract:', error);
        throw error;
    }
};




