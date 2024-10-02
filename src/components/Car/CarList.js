// Parent Component
import React, { useEffect, useState } from 'react';
import { getCars } from '../../services/carService';
import CarTable from './CarTable';

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await getCars();

                // Check if response is an array or an object with a cars property
                if (!Array.isArray(response)) {
                    throw new Error('Failed to fetch cars');
                }

                setCars(response); // Set the cars state
            } catch (error) {
                console.error('Error fetching cars:', error);
            } finally {
                setLoading(false); // Ensure loading is set to false after the fetch
            }
        };

        fetchCars();
    }, []);

    if (loading) {
        return <p>Loading cars...</p>; // Display loading state
    }

    return <CarTable cars={cars} setCars={setCars}/>; // Pass cars to CarTable
};

export default CarList;
