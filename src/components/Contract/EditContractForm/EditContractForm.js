import React, { useState, useEffect } from 'react';
import { getAvailableCarsForPeriod } from '../../../services/carService';
import { searchCustomersByName } from '../../../services/customerService';
import Modal from '../../Modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import './EditContractForm.css';

const EditContractForm = ({ contract, onCancel, onSave }) => {
    const [editContract, setEditContract] = useState({
        _id: contract._id,
        customer: contract.customer, // Will hold the selected customer object
        car: contract.car, // Will hold the selected car
        rentalPeriod: {
            startDate: contract.rentalPeriod.startDate.split('T')[0],
            endDate: contract.rentalPeriod.endDate.split('T')[0],
        },
        rentalPrice: {
            dailyRate: contract.rentalPrice.dailyRate,
            totalAmount: contract.rentalPrice.totalAmount,
        },
        additionalNotes: contract.additionalNotes,
        contractPhoto: contract.contractPhoto,
    });

    const [availableCars, setAvailableCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [datesSelected, setDatesSelected] = useState(false);

    const [customerSearch, setCustomerSearch] = useState(contract.customer.name);
    const [customerResults, setCustomerResults] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    useEffect(() => {
        // Fetch available cars if dates are selected
        if (editContract.rentalPeriod.startDate && editContract.rentalPeriod.endDate) {
            fetchCarsForPeriod(editContract.rentalPeriod.startDate, editContract.rentalPeriod.endDate);
        }
    }, [editContract.rentalPeriod]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const path = name.split('.');

        if (path.length === 1) {
            setEditContract((prev) => ({ ...prev, [name]: value }));
        } else {
            setEditContract((prev) => ({
                ...prev,
                [path[0]]: {
                    ...prev[path[0]],
                    [path[1]]: value,
                },
            }));
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const { startDate, endDate } = {
            ...editContract.rentalPeriod,
            [name.split('.')[1]]: value,
        };

        // Validate date selection
        if (name === "rentalPeriod.endDate" && new Date(value) < new Date(startDate)) {
            alert('End date cannot be earlier than start date');
            return;
        }

        if (name === "rentalPeriod.startDate" && endDate && new Date(endDate) < new Date(value)) {
            alert('Start date cannot be later than end date');
            return;
        }

        setEditContract((prev) => ({
            ...prev,
            rentalPeriod: {
                ...prev.rentalPeriod,
                [name.split('.')[1]]: value,
            },
        }));

        // Fetch cars for the selected period
        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            fetchCarsForPeriod(startDate, endDate);
        }
    };

    const fetchCarsForPeriod = async (startDate, endDate) => {
        setLoadingCars(true);
        try {
            const cars = await getAvailableCarsForPeriod(startDate, endDate);
            setAvailableCars(cars);
            setDatesSelected(true);
        } catch (error) {
            console.error('Error fetching available cars:', error);
        } finally {
            setLoadingCars(false);
        }
    };

    const handleCarSelect = (carId) => {
        const selectedCar = availableCars.find((car) => car._id === carId);
        if (selectedCar) {
            setEditContract((prev) => ({
                ...prev,
                car: selectedCar,
                rentalPrice: {
                    ...prev.rentalPrice,
                    dailyRate: selectedCar.price_per_day,
                    totalAmount: calculateTotalAmount(prev.rentalPeriod.startDate, prev.rentalPeriod.endDate, selectedCar.price_per_day),
                },
            }));
        }
    };

    const calculateTotalAmount = (startDate, endDate, dailyRate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays > 0 ? differenceInDays * dailyRate : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            onSave(editContract);
            onCancel();
        } catch (error) {
            console.error('Error updating contract:', error);
        }
    };

    const handleCustomerSearch = async (e) => {
        const query = e.target.value;
        setCustomerSearch(query);

        if (query.length > 2) {
            setLoadingCustomers(true);
            try {
                const results = await searchCustomersByName(query);
                setCustomerResults(results);
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoadingCustomers(false);
            }
        } else {
            setCustomerResults([]);
        }
    };

    const handleCustomerSelect = (customer) => {
        setEditContract((prev) => ({ ...prev, customer }));
        setCustomerSearch(customer.name); // Update input field to selected customer name
        setCustomerResults([]); // Clear search results after selection
    };

    return (
        <Modal onClose={onCancel}>
            <form onSubmit={handleSubmit} className="edit-contract-form">
                {/* Customer Search */}
                <div className="form-section customer-search">
                    <label className="form-label">Search Customer:</label>
                    <input
                        type="text"
                        value={customerSearch}
                        onChange={handleCustomerSearch}
                        placeholder="Enter customer name"
                        className="form-input"
                    />
                    {loadingCustomers && <p className="loading-text">Loading customers...</p>}
                    {customerResults.length > 0 && (
                        <ul className="customer-results-list">
                            {customerResults.map((customer) => (
                                <li
                                    key={customer._id}
                                    onClick={() => handleCustomerSelect(customer)}
                                    className="customer-item"
                                >
                                    {customer.name} ({customer.passport_number})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
    
                {/* Date Picker */}
                <div className="form-section date-picker">
                    <label className="form-label">Start Date:</label>
                    <input
                        type="date"
                        name="rentalPeriod.startDate"
                        value={editContract.rentalPeriod.startDate}
                        onChange={handleDateChange}
                        className="form-input"
                        required
                    />
                    <label className="form-label">End Date:</label>
                    <input
                        type="date"
                        name="rentalPeriod.endDate"
                        value={editContract.rentalPeriod.endDate}
                        onChange={handleDateChange}
                        className="form-input"
                        required
                    />
                </div>
    
                {/* Car Select */}
                <div className="form-section car-select">
                    {datesSelected && (
                        <>
                            <label className="form-label">Select Car:</label>
                            <select
                                name="car"
                                value={editContract.car._id || ""}
                                onChange={(e) => handleCarSelect(e.target.value)}
                                className="form-select"
                                required
                            >
                                <option value={editContract.car}>{editContract.car.model} {editContract.car.license_plate}</option>
                                {availableCars.length > 0 ? (
                                    availableCars.map((car) => (
                                        <option key={car._id} value={car._id}>
                                            {car.model} - ${car.price_per_day}/day
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>No cars available</option>
                                )}
                            </select>
                        </>
                    )}
                </div>
    
                {/* Rental Pricing */}
                {editContract.rentalPrice.dailyRate > 0 && (
                    <div className="form-section rental-pricing">
                        <p className="price-text"><strong>Daily Rate:</strong> ${editContract.rentalPrice.dailyRate}</p>
                        <p className="price-text"><strong>Total Amount:</strong> ${editContract.rentalPrice.totalAmount}</p>
                    </div>
                )}
    
                {/* Additional Notes */}
                <div className="form-section">
                    <label className="form-label">
                        Additional Notes:
                        <textarea
                            name="additionalNotes"
                            value={editContract.additionalNotes}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter any additional notes here..."
                            className="form-textarea"
                        />
                    </label>
                </div>
    
                {/* Contract Photo */}
                <div className="form-section">
                    <label className="form-label">
                        Contract Photo (URL):
                        <input
                            type="text"
                            name="contractPhoto"
                            value={editContract.contractPhoto}
                            onChange={handleChange}
                            placeholder="Enter photo URL..."
                            className="form-input"
                        />
                    </label>
                </div>
    
                {/* Submit and Cancel Buttons */}
                <div className="form-buttons">
                    <button
                        type="submit"
                        disabled={!datesSelected || !editContract.car._id || !editContract.customer._id}
                        className="submit-button"
                    >
                        <FontAwesomeIcon icon={faCar} /> Update Contract
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditContractForm;
