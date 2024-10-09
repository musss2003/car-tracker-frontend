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

