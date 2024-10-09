import React, { useState, useEffect } from 'react';
import { getActiveContracts } from '../../services/contractService'; // Make sure to import the deleteCar function
import EditCarForm from './EditCarForm';
import { updateCar, getCars, deleteCar } from '../../services/carService';
import { TrashIcon } from '@heroicons/react/solid';

const CarTable = ({ cars, setCars }) => {
    const [activeContracts, setActiveContracts] = useState([]);
    const [editCar, setEditCar] = useState(null);

    useEffect(() => {
        const fetchActiveContracts = async () => {
            try {
                const contracts = await getActiveContracts();
                setActiveContracts(contracts);
            } catch (error) {
                console.error('Error fetching active contracts:', error);
            }
        };
        fetchActiveContracts();
    }, []);

    const handleSave = async (updatedCar) => {
        try {
            await updateCar(updatedCar.license_plate, updatedCar);
            const updatedCars = await getCars();
            setCars(updatedCars);
            setEditCar(null);
        } catch (error) {
            console.error('Error saving car:', error);
        }
    };

    const handleCancel = () => {
        setEditCar(null);
    };

    const busyCars = new Set(activeContracts.map(contract => contract.carLicensePlate));

    const handleDelete = async (licensePlate) => {
        const confirmed = window.confirm("Are you sure you want to delete this car?");
        if (confirmed) {
            try {
                await deleteCar(licensePlate); // Call your delete function here
                // Refetch cars after deletion to get the latest state
                const updatedCars = await getCars();
                setCars(updatedCars);
            } catch (error) {
                console.error('Error deleting car:', error);
            }
        }
    };

    return (
        <>
            {editCar && <EditCarForm car={editCar} onSave={handleSave} onCancel={handleCancel} />}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price per Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {cars.map(car => (
                        <tr key={car.license_plate}>
                            <td className="px-6 py-4 whitespace-nowrap">{car.manufacturer}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{car.year}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{car.color || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{car.license_plate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{car.price_per_day ? `$${car.price_per_day}` : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {busyCars.has(car.license_plate) ? (
                                    <span className="text-red-500">Busy</span>
                                ) : (
                                    <span className="text-green-500">Available</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button onClick={() => setEditCar(car)}>Edit</button>
                                <button onClick={() => handleDelete(car.license_plate)} className="ml-2 text-red-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 mr-1 ml-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M6 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 000-2h-1V3a1 1 0 00-1-1H6zm2 0h4v1H8V2zm1 4a1 1 0 00-1 1v10a1 1 0 002 0V7a1 1 0 00-1-1z" />
                                        <path d="M5 8a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V8z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default CarTable;
