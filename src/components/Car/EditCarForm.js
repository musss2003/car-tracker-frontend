import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditCarForm = ({ car, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        manufacturer: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        price_per_day: ''
    });

    useEffect(() => {
        if (car) {
            setFormData({
                manufacturer: car.manufacturer,
                model: car.model,
                year: car.year,
                color: car.color || '',
                license_plate: car.license_plate,
                price_per_day: car.price_per_day || ''
            });
        }
    }, [car]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleUpdateCar = async (e) => {
        e.preventDefault();
        try {
            await onSave(formData);
            toast.success('Car updated successfully!');
        } catch (error) {
            console.error('Error updating car:', error);
            toast.error('Failed to update car.');
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-500 bg-opacity-75 fixed inset-0 z-40">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Car</h2>
                <form onSubmit={handleUpdateCar}>
                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                            <input
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                placeholder="Manufacturer"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <input
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="Model"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <input
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                placeholder="Year"
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <input
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="Color"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">License Plate</label>
                            <input
                                name="license_plate"
                                value={formData.license_plate}
                                onChange={handleChange}
                                placeholder="License Plate"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="block text-sm font-medium text-gray-700">Price Per Day</label>
                            <input
                                name="price_per_day"
                                value={formData.price_per_day}
                                onChange={handleChange}
                                placeholder="Price Per Day"
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-between">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md">Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCarForm;
