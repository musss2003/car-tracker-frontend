import React, { useState, useEffect } from 'react';
import { addRental } from '../../../services/rentalService';
import { getCustomers } from '../../../services/customerService';
import { getCars } from '../../../services/carService';
import { uploadImage } from '../../../services/uploadService';
import { toast } from "react-toastify";

const AddRentalForm = ({ onClose, onAdd }) => {
    const [customer_id, setCustomerId] = useState('');
    const [car_id, setCarId] = useState('');
    const [rental_start_date, setRentalStartDate] = useState('');
    const [rental_end_date, setRentalEndDate] = useState('');
    const [total_price, setTotalPrice] = useState('');
    const [contractPhoto, setContractPhoto] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [cars, setCars] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await getCustomers();
                setCustomers(response.customers);
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        };

        const fetchCars = async () => {
            try {
                const response = await getCars();
                setCars(response);
            } catch (error) {
                console.error('Error fetching cars:', error);
            }
        };

        fetchCustomers();
        fetchCars();
    }, []);

    const handleSave = async () => {
        if (!customer_id || !car_id) {
            toast.error('Please select both a customer and a car');
            return;
        }

        try {
            const contractPhotoUrl = contractPhoto ? await uploadImage(contractPhoto) : '';

            const newRental = {
                customer_id,
                car_id,
                rental_start_date,
                rental_end_date,
                total_price,
                contractPhotoUrl
            };

            const addedRental = await addRental(newRental);
            onAdd(addedRental);
            onClose();
            toast.success('Rental added successfully');
        } catch (error) {
            console.error('Error adding rental:', error);
            toast.error('Error adding rental');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Add Rental</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700">Customer</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={customer_id}
                            onChange={(e) => setCustomerId(e.target.value)}
                        >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                                <option key={customer._id} value={customer._id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Car</label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            value={car_id}
                            onChange={(e) => setCarId(e.target.value)}
                        >
                            <option value="">Select a car</option>
                            {cars.map((car) => (
                                <option key={car._id} value={car._id}>
                                    {car.make} {car.model} ({car.year}) - {car.color}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Rental Start Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={rental_start_date}
                            onChange={(e) => setRentalStartDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Rental End Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={rental_end_date}
                            onChange={(e) => setRentalEndDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Total Price</label>
                        <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={total_price}
                            onChange={(e) => setTotalPrice(e.target.value)}
                        />
                    </div>
                    <div className="mb-4 col-span-full">
                        <label className="block text-gray-700">Contract Photo</label>
                        <input
                            type="file"
                            name='image'
                            className="w-full p-2 border border-gray-300 rounded"
                            onChange={(e) => setContractPhoto(e.target.files[0])}
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Cancel</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default AddRentalForm;