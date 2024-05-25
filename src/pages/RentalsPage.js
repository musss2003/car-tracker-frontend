import React, { useEffect, useState } from 'react';
import RentalCard from '../containers/Rental/RentalCard/RentalCard.js';
import { getRentals } from '../services/rentalService';
import AddRentalForm from '../components/Rental/AddRentalForm/AddRentalForm.js';



const RentalsPage = () => {
    const [rentals, setRentals] = useState([]);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);


    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await getRentals();
                setRentals(response);
            } catch (error) {
                setError('Error fetching rentals');
                console.error(error);
            }
        };

        fetchRentals();
    }, []);

    const handleAddRental = (newRental) => {
        setRentals([...rentals, newRental]);
    };

    return (
        <div className="rentals-page p-6 text-center">
            <h1 className="text-3xl font-bold mb-6">Rentals List</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-6"
                onClick={() => setShowAddForm(true)}
            >
                Add Rental
            </button>
            <div className="rental-list flex flex-wrap justify-center">
                {rentals.map((rental) => (
                    <RentalCard key={rental._id} rental={rental} />
                ))}
            </div>
            {showAddForm && (
                <AddRentalForm onClose={() => setShowAddForm(false)} onAdd={handleAddRental} />
            )}
        </div>
    );
};

export default RentalsPage;
