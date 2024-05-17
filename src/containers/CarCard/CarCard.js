import React, { useState } from 'react';
import EditCarModal from '../../components/EditCarModal/EditCarModal';
import ViewRentalsModal from '../../components/ViewRentalsModal/ViewRentalsModal';
import { TrashIcon } from '@heroicons/react/outline'; // Using Heroicons for delete icon

const CarCard = ({ car, onEdit, onDelete }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRentalsModal, setShowRentalsModal] = useState(false);

    const handleEditClick = () => setShowEditModal(true);
    const handleViewRentalsClick = () => setShowRentalsModal(true);
    const handleDeleteClick = () => {
        const confirmed = window.confirm(`Are you sure you want to delete ${car.make} ${car.model}?`);
        if (confirmed) {
            onDelete(car._id);
        }
    };

    return (
        <>
            <div className="car-card bg-white shadow-lg rounded-lg overflow-hidden m-4 max-w-sm transition-transform transform hover:scale-105">
                <div className="relative">
                    {car.profilePhotoUrl ? (
                        <img src={car.profilePhotoUrl} alt={`${car.make} ${car.model}`} className="w-full h-48 object-fill" />
                    ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Nema sike</span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-slate-200 bg-opacity-75 px-2 py-1 rounded">
                        <p className="text-xl">{car.license_plate}</p>
                    </div>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-2">{car.make} {car.model}</h2>
                    <p className="text-gray-700 mb-1"><strong>Godina:</strong> {car.year}</p>
                    <p className="text-gray-700 mb-1"><strong>Boja:</strong> {car.color}</p>
                    <p className="text-gray-700 mb-1"><strong>Broj šasije:</strong> {car.chassis_number || 'N/A'}</p>
                    <p className="text-gray-700 mb-1"><strong>Cijena po danu:</strong> {car.price_per_day ? `${car.price_per_day}KM` : 'N/A'}</p>
                    <div className="mt-4 flex justify-between">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={handleEditClick}>Uredi</button>
                        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition" onClick={handleViewRentalsClick}>Pogledaj rente</button>
                        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition" onClick={handleDeleteClick}>
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {showEditModal && <EditCarModal car={car} onClose={() => setShowEditModal(false)} onEdit={onEdit} />}
            {showRentalsModal && <ViewRentalsModal carId={car._id} onClose={() => setShowRentalsModal(false)} />}
        </>
    );
}

export default CarCard;
