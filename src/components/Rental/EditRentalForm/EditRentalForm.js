import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { getCustomers } from '../../../services/customerService';
import { getCars } from '../../../services/carService';
import { uploadImage } from '../../../services/uploadService';

const formatDate = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

const EditRentalForm = ({ rental, onClose, onUpdate }) => {
    const [customer_id, setCustomerId] = useState(rental.customer_id._id || '');
    const [car_id, setCarId] = useState(rental.car_id._id || '');
    const [rental_start_date, setRentalStartDate] = useState(formatDate(rental.rental_start_date));
    const [rental_end_date, setRentalEndDate] = useState(formatDate(rental.rental_end_date));
    const [total_price, setTotalPrice] = useState(rental.total_price || '');
    const [contractPhoto, setContractPhoto] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [cars, setCars] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const contractPhotoUrl = contractPhoto ? await uploadImage(contractPhoto) : rental.contractPhotoUrl;

            const updatedRental = {
                customer_id,
                car_id,
                rental_start_date,
                rental_end_date,
                total_price,
                contractPhotoUrl
            };

            await onUpdate(rental._id, updatedRental);
            onClose();
            toast.success('Rental updated successfully');
        } catch (error) {
            console.error('Error updating rental:', error);
            toast.error('Error updating rental');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit Rental</h2>
                <form onSubmit={handleSave} className="space-y-4">
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
                        <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={onClose}>Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRentalForm;
