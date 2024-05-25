import React from 'react';

const RentalCard = ({ rental, onViewDetails, onEdit, onDelete }) => {
    return (
        <div className="rental-card bg-white shadow-lg rounded-lg overflow-hidden m-4 max-w-sm transition-transform transform hover:scale-105">
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">Rental for {rental.customer_id?.name}</h2>
                <p className="text-gray-700 mb-1"><strong>Car:</strong> {rental.car_id?.make} {rental.car_id?.model}</p>
                <p className="text-gray-700 mb-1"><strong>Start Date:</strong> {new Date(rental.rental_start_date).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-1"><strong>End Date:</strong> {new Date(rental.rental_end_date).toLocaleDateString()}</p>
                <div className="mt-4 flex justify-between">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={() => onViewDetails(rental)}>View Details</button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition" onClick={() => onEdit(rental)}>Edit</button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition" onClick={() => onDelete(rental)}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default RentalCard;
