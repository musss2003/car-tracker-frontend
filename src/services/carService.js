// services/carService.js
import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/'; // Adjust based on your actual API URL


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

export const getAvailableCarsForPeriod = async (startingDate, endingDate) => {
    try {
        const response = await fetch(`${API_URL}cars/available`, {
            method: 'POST', // We are posting because we need to send data (the rental period)
            headers: getAuthHeaders(),
            body: JSON.stringify({ startingDate, endingDate }), // Send the dates to the backend
        });

        if (!response.ok) {
            throw new Error(`Error fetching available cars: ${response.status}`);
        }

        const availableCars = await response.json();
        return availableCars; // This will return the list of available cars
    } catch (error) {
        console.error('Error fetching available cars:', error);
        throw error;
    }
};


export const getCarAvailability = async (licensePlate) => {
    // const response = await fetch(`/api/cars/${licensePlate}/availability`)
    // if (!response.ok) {
    //   throw new Error('Failed to fetch car availability')
    // }
    // return await response.json()
    return mockAvailability;
  }
  

  const mockAvailability = [
    {
      start: new Date(2025, 3, 24),
      end: new Date(2025, 3, 26),
      title: 'Reserved by Customer A',
    },
  ]
  