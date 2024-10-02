// services/carService.js

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Set Authorization header with token
    };
};

export const getCar = async (carId) => {
    try {
        const response = await fetch(`${API_URL}cars/${carId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include', // Include credentials for cookies if needed
        });
        if (!response.ok) {
            throw new Error(`Error getting car: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting car:', error);
        throw error;
    }
};

export const getCars = async () => {
    try {
        const response = await fetch(`${API_URL}cars`, {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include', // Include credentials for cookies if needed
        });

        if (!response.ok) {
            throw new Error(`Error getting all cars: ${response.statusText}`);
        }
        const data = await response.json();

        return data || []; // Adjust according to your API response structure
    } catch (error) {
        console.error('Error getting all cars:', error);
        throw error;
    }
};

export const updateCar = async (license_plate, car) => {
    try {
        console.log(JSON.stringify(car))
        const response = await fetch(`${API_URL}cars/${license_plate}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
            },
            body: JSON.stringify(car), // Convert car object to JSON
            credentials: 'include', // Include credentials for cookies if needed
        });
        if (!response.ok) {
            throw new Error(`Error updating car: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating car:', error);
    }
};

export const deleteCar = async (id) => {
    try {
        const response = await fetch(`${API_URL}cars/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include', // Include credentials for cookies if needed
        });
        if (!response.ok) {
            throw new Error(`Error deleting car: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting car:', error);
        throw error;
    }
};

export const addCar = async (car) => {
    try {
        const response = await fetch(`${API_URL}cars`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
            },
            body: JSON.stringify(car), // Convert car object to JSON
            credentials: 'include', // Include credentials for cookies if needed
        });
        if (!response.ok) {
            throw new Error(`Error adding car: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error adding car:', error);
        throw error;
    }
};
