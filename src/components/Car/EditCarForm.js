import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify'; // Ensure you have react-toastify installed

const EditCarForm = ({ car, onSave, onCancel }) => {
    // State to hold the form values
    const [formData, setFormData] = useState({
        manufacturer: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        price_per_day: ''
    });

    useEffect(() => {
        // Populate the form fields with the current car data
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

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Function to handle the update
    const handleUpdateCar = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            // Call the onSave function passed from the parent
            await onSave(formData);
            toast.success('Car updated successfully!'); // Show success message
        } catch (error) {
            console.error('Error updating car:', error);
            toast.error('Failed to update car.'); // Show error message
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Car</h2>
                <form onSubmit={handleUpdateCar}>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            placeholder="Manufacturer"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="Model"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="Year"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Color"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="license_plate"
                            value={formData.license_plate}
                            onChange={handleChange}
                            placeholder="License Plate"
                            required
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="number"
                            name="price_per_day"
                            value={formData.price_per_day}
                            onChange={handleChange}
                            placeholder="Price Per Day"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCarForm;
