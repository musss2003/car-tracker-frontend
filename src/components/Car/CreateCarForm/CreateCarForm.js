import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './CreateCarForm.css';

const CreateCarForm = ({ onSave, onClose }) => {
    const [car, setCar] = useState({
        manufacturer: '',
        model: '',
        year: '',
        color: '',
        license_plate: '',
        chassis_number: '',
        price_per_day: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCar({ ...car, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            onSave(car);
            toast.success('Car created successfully');
        } catch (error) {
            console.error('Error creating car:', error);
            toast.error('Failed to create car');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit} className="create-car-form">
                    <div>
                        <label>Manufacturer:</label>
                        <input
                            type="text"
                            name="manufacturer"
                            value={car.manufacturer || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Model:</label>
                        <input
                            type="text"
                            name="model"
                            value={car.model || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Year:</label>
                        <input
                            type="number"
                            name="year"
                            value={car.year || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Color:</label>
                        <input
                            type="text"
                            name="color"
                            value={car.color || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>License Plate:</label>
                        <input
                            type="text"
                            name="license_plate"
                            value={car.license_plate || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Chassis Number:</label>
                        <input
                            type="text"
                            name="chassis_number"
                            value={car.chassis_number || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Price Per Day:</label>
                        <input
                            type="number"
                            name="price_per_day"
                            value={car.price_per_day || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Create Car</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default CreateCarForm;