import React, { useEffect, useState } from 'react';

const ViewRentalsModal = ({ carId, onClose }) => {
    const [rentals, setRentals] = useState([]);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await fetch(`/api/rentals?carId=${carId}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setRentals(data);
                }
            } catch (error) {
                console.error('Error fetching rentals:', error);
            }
        };

        fetchRentals();
    }, [carId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Rentals for Car</h2>
                <ul className="space-y-4">
                    {rentals.map(rental => (
                        <li key={rental._id} className="border-b pb-2">
                            <p><strong>Rental ID:</strong> {rental._id}</p>
                            <p><strong>Customer:</strong> {rental.customerName}</p>
                            <p><strong>Start Date:</strong> {new Date(rental.startDate).toLocaleDateString()}</p>
                            <p><strong>End Date:</strong> {new Date(rental.endDate).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewRentalsModal;
