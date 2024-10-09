import React, { useState, useEffect } from 'react';
import { getActiveContracts } from '../../services/contractService';
import EditCarForm from './EditCarForm';
import { updateCar, getCars, deleteCar } from '../../services/carService';

const ActionButton = ({ onClick, icon, label, className }) => (
    <button onClick={onClick} className={`ml-2 px-3 py-1 rounded-md transition-all duration-200 ease-in-out ${className}`}>
        {icon}
        <span className="ml-1">{label}</span>
    </button>
);

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
                await deleteCar(licensePlate);
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
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Manufacturer</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License Plate</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price per Day</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {cars.map(car => (
                            <tr key={car.license_plate} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{car.manufacturer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.color || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.license_plate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.price_per_day ? `$${car.price_per_day}` : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {busyCars.has(car.license_plate) ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-600">
                                            Busy
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-600">
                                            Available
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <ActionButton
                                        onClick={() => setEditCar(car)}
                                        icon={<span>Edit</span>}
                                        className="text-blue-600 hover:text-blue-900"
                                    />
                                </td>
                                <td>
                                    <ActionButton
                                        onClick={() => handleDelete(car.license_plate)}
                                        icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-red-600 m-auto"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M6 2a1 1 0 00-1 1v1H4a1 1 0 000 2h12a1 1 0 000-2h-1V3a1 1 0 00-1-1H6zm2 0h4v1H8V2zm1 4a1 1 0 00-1 1v10a1 1 0 002 0V7a1 1 0 00-1-1z" />
                                                <path d="M5 8a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H6a1 1 0 01-1-1V8z" />
                                            </svg>
                                        }
                                        className="text-red-600 hover:text-red-900"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default CarTable;
