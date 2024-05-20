import React, { useEffect, useState } from 'react';
import RentalCard from '../containers/RentalCard/RentalCard.js';
import { getRentals } from '../services/rentalService';


const RentalsPage = () => {
    const [rentals, setRentals] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await getRentals();
                console.log(response);
                setRentals(response.data);
            } catch (error) {
                setError('Error fetching rentals');
                console.error(error);
            }
        };

        fetchRentals();
    }, []);

    return (
        <div className="rentals-page p-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Lista renti</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="rental-list flex flex-wrap justify-center">
                {rentals.map((rental) => (
                    <RentalCard key={rental._id} rental={rental} />
                ))}
            </div>
        </div>
    );
};

export default RentalsPage;
