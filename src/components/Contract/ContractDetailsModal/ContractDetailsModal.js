import React, { useEffect, useState } from 'react';
import { deleteContract, updateContract } from '../../../services/contractService';
import './ContractDetailsModal.css';
import { getCustomers } from '../../../services/customerService';
import { getAvailableCarsForPeriod } from '../../../services/carService';

export const ContractDetailsModal = ({ contract, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedContract, setUpdatedContract] = useState({ ...contract });
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [availableCars, setAvailableCars] = useState([]);

    const calculateTotalAmount = (startDate, endDate, dailyRate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays > 0 ? differenceInDays * dailyRate : 0;
    };

    useEffect(() => {

        fetchAvailableCarsByDates(updatedContract.rentalPeriod.startDate, updatedContract.rentalPeriod.endDate);
        setCustomerSearch(updatedContract.customer.name);

    }, [updatedContract]);

    // Fetch customers based on search input
    const handleCustomerSearch = async (e) => {
        const value = e.target.value;
        setCustomerSearch(value);
        setLoadingCustomers(true);

        if (value) {
            const results = await getCustomers(value);
            setCustomerResults(results);
        } else {
            setCustomerResults([]);
        }
        setLoadingCustomers(false);
    };

    const handleCustomerSelect = (customer) => {
        setUpdatedContract((prev) => ({
            ...prev,
            customer: { id: customer._id, name: customer.name, email: customer.email }
        }));
        setCustomerSearch(customer.name);
        setCustomerResults([]);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setUpdatedContract((prev) => ({
            ...prev,
            rentalPeriod: {
                ...prev.rentalPeriod,
                [name.split('.')[1]]: value
            }
        }));

        fetchAvailableCarsByDates(updatedContract.rentalPeriod.startDate, updatedContract.rentalPeriod.endDate);
    };

    const fetchAvailableCarsByDates = async (startDate, endDate) => {
        // Adjust this API call based on your service
        const cars = await getAvailableCarsForPeriod(startDate, endDate);
        setAvailableCars(cars);
    };

    const handleCarSelect = (carId) => {
        const selectedCar = availableCars.find(car => car._id === carId);
        setUpdatedContract((prev) => ({
            ...prev,
            car: selectedCar,
            rentalPrice: {
                dailyRate: selectedCar.price_per_day,
                totalAmount: calculateTotalAmount(updatedContract.rentalPeriod.startDate, updatedContract.rentalPeriod.endDate, selectedCar.price_per_day)
            }
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const path = name.split('.');

        if (path.length === 1) {
            setUpdatedContract((prev) => ({ ...prev, [name]: value }));
        } else {
            setUpdatedContract((prev) => ({
                ...prev,
                [path[0]]: {
                    ...prev[path[0]],
                    [path[1]]: value
                }
            }));
        }
    };

    const handleSave = async () => {
        try {
            await updateContract(updatedContract._id, updatedContract);
            onUpdate(updatedContract);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating contract:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteContract(contract._id);
            onClose();
        } catch (error) {
            console.error("Error deleting contract:", error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Contract Details</h2>
                {isEditing ? (
                    <div className="edit-form">
                        {/* Customer Search */}
                        <div className="customer-search">
                            <label>Search Customer:</label>
                            <input
                                type="text"
                                value={customerSearch}
                                onChange={handleCustomerSearch}
                            />
                            {loadingCustomers && <p>Loading customers...</p>}

                            {/* Move this div to be immediately after the input field */}
                            {customerResults.length > 0 && (
                                <ul className="customer-results-list">
                                    {customerResults.map((customer) => (
                                        <li key={customer._id} onClick={() => handleCustomerSelect(customer)}>
                                            {customer.name} ({customer.passport_number})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Rental Period */}
                        <label>
                            Start Date:
                            <input
                                type="date"
                                name="rentalPeriod.startDate"
                                value={new Date(updatedContract.rentalPeriod.startDate).toISOString().split('T')[0]}
                                onChange={handleDateChange}
                                required
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                name="rentalPeriod.endDate"
                                value={new Date(updatedContract.rentalPeriod.endDate).toISOString().split('T')[0]}
                                onChange={handleDateChange}
                                required
                            />
                        </label>

                        {/* Car Selection */}
                        <>
                            <label>Select Car:</label>
                            <select
                                name="car"
                                value={updatedContract.car ? updatedContract.car._id : ""}
                                onChange={(e) => handleCarSelect(e.target.value)}
                                required
                            >
                                <option value="">{updatedContract.car.model} - ${updatedContract.car.price_per_day}/day</option>
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

                        {/* Other fields */}
                        <label>
                            Daily Rate:
                            <p>{updatedContract.rentalPrice.dailyRate}</p>
                        </label>
                        <label>
                            Total Amount:
                            <p>{updatedContract.rentalPrice.totalAmount}</p>

                        </label>
                        <label>
                            Additional Notes:
                            <textarea
                                name="additionalNotes"
                                value={updatedContract.additionalNotes}
                                onChange={handleChange}
                            />
                        </label>

                        <button onClick={handleSave}>Save</button>
                    </div>
                ) : (
                    <div className="details-view">
                        <p><strong>Customer Name:</strong> {contract.customer ? contract.customer.name : 'N/A'}</p>
                        <p><strong>Car Model:</strong> {contract.car ? contract.car.model : 'N/A'}</p>
                        <p><strong>Start Date:</strong> {new Date(contract.rentalPeriod.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(contract.rentalPeriod.endDate).toLocaleDateString()}</p>
                        <p><strong>Daily Rate:</strong> ${contract.rentalPrice.dailyRate}</p>
                        <p><strong>Total Amount:</strong> ${contract.rentalPrice.totalAmount}</p>
                        <p><strong>Additional Notes:</strong> {contract.additionalNotes}</p>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                        <button className='delete' onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};
