import React from 'react';

const RentalCard = ({ rental }) => {
    return (
        <div className="rental-card bg-white shadow-lg rounded-lg overflow-hidden m-4 max-w-sm">
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{rental.car_id.make} {rental.car_id.model}</h2>
                <p className="text-gray-700 mb-1"><strong>Customer:</strong> {rental.customer_id.name}</p>
                <p className="text-gray-700 mb-1"><strong>Rental Start Date:</strong> {new Date(rental.rental_start_date).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-1"><strong>Rental End Date:</strong> {new Date(rental.rental_end_date).toLocaleDateString()}</p>
                <p className="text-gray-700 mb-1"><strong>Total Price:</strong> ${rental.total_price}</p>
                <p className="text-gray-700 mb-1"><strong>Status:</strong> {rental.status}</p>
                {rental.passportPhotoUrl && (
                    <div className="mt-4">
                        <strong>Passport Photo:</strong>
                        <img src={rental.passportPhotoUrl} alt="Passport" className="w-full h-auto mt-2" />
                    </div>
                )}
                {rental.drivingLicensePhotoUrl && (
                    <div className="mt-4">
                        <strong>Driving License Photo:</strong>
                        <img src={rental.drivingLicensePhotoUrl} alt="Driving License" className="w-full h-auto mt-2" />
                    </div>
                )}
                {rental.contractPhotoUrl && (
                    <div className="mt-4">
                        <strong>Contract Photo:</strong>
                        <img src={rental.contractPhotoUrl} alt="Contract" className="w-full h-auto mt-2" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalCard;
