import React from 'react';

const RentalDetailsModal = ({ rental, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Rental Details</h2>
                <div className="space-y-3">
                    <p className="text-gray-700"><strong>Customer:</strong> {rental.customer_id.name}</p>
                    <p className="text-gray-700"><strong>Car:</strong> {rental.car_id.make} {rental.car_id.model}</p>
                    <p className="text-gray-700"><strong>Start Date:</strong> {new Date(rental.rental_start_date).toLocaleDateString()}</p>
                    <p className="text-gray-700"><strong>End Date:</strong> {new Date(rental.rental_end_date).toLocaleDateString()}</p>
                    <p className="text-gray-700"><strong>Total Price:</strong> {rental.total_price}</p>
                    {rental.contractPhotoUrl && (
                        <div className="my-4">
                            <h3 className="text-xl font-semibold">Contract Photo</h3>
                            <img src={rental.contractPhotoUrl} alt="Contract" className="mt-2 rounded-md w-full h-auto" />
                        </div>
                    )}
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default RentalDetailsModal;
