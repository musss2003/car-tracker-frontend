import React, { useState, useEffect } from 'react';
import { getActiveContracts } from '../../services/contractService';
import EditCarForm from './EditCarForm'; // Importing the EditCarForm
import { updateCar, getCars } from '../../services/carService';

const CarTable = ({ cars, setCars }) => {
    const [activeContracts, setActiveContracts] = useState([]); // State to hold active contracts
    const [editCar, setEditCar] = useState(null); // State to manage the car being edited

    useEffect(() => {
        const fetchActiveContracts = async () => {
            try {
                const contracts = await getActiveContracts(); // Fetch active contracts
                setActiveContracts(contracts); // Set the active contracts state
            } catch (error) {
                console.error('Error fetching active contracts:', error);
            }
        };
        fetchActiveContracts(); // Call the function to fetch contracts
    }, []);

    const handleSave = async (updatedCar) => {
        try {
            // Update the car in the backend
            await updateCar(updatedCar.license_plate, updatedCar);

            // Refetch cars to get the latest state
            const updatedCars = await getCars();
            setCars(updatedCars); // Update the cars state with the new data

            // Close the edit form
            setEditCar(null);
        } catch (error) {
            console.error('Error saving car:', error);
        }
    };

    const handleCancel = () => {
        setEditCar(null); // Close the edit form
    };

    const busyCars = new Set(activeContracts.map(contract => contract.carLicensePlate)); // Set of busy cars

    return (
        <>
            {editCar && <EditCarForm car={editCar} onSave={handleSave} onCancel={handleCancel} />} {/* Render edit form if editing */}
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default CarTable; // Export the CarTable component
