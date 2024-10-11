import React, { useState } from 'react';
import { createContract } from '../../../services/contractService';
import { getAvailableCarsForPeriod } from '../../../services/carService';
import { searchCustomersByName } from '../../../services/customerService'; // New service for customer search
import './CreateContractForm.css';
import Modal from '../../Modal/Modal';

export const CreateContractForm = ({ onClose }) => {
    const [newContract, setNewContract] = useState({
        customer: {}, // Will hold the selected customer object
        car: {}, // Will hold the selected car
        rentalPeriod: {
            startDate: '',
            endDate: '',
        },
        rentalPrice: {
            dailyRate: 0,
            totalAmount: 0,
        },
        status: 'active', // Default to 'active'
        paymentDetails: {
            paymentMethod: '',
            paymentStatus: 'pending', // Default to 'pending'
        },
        additionalNotes: '',
        contractPhoto: '', // Optional photo field
    });

    const [availableCars, setAvailableCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [datesSelected, setDatesSelected] = useState(false);

    const [customerSearch, setCustomerSearch] = useState(''); // To hold the search query
    const [customerResults, setCustomerResults] = useState([]); // To hold the search results
    const [loadingCustomers, setLoadingCustomers] = useState(false); // To track loading customers

    const handleChange = (e) => {
        const { name, value } = e.target;
        const path = name.split('.');

        if (path.length === 1) {
            setNewContract((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewContract((prev) => ({
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
        handleChange(e);

        const { startDate, endDate } = {
            ...newContract.rentalPeriod,
            [name.split('.')[1]]: value,
        };

        if (startDate && endDate) {
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

    const handleCarSelect = (car) => {
        setNewContract((prev) => ({
            ...prev,
            car: car,
            rentalPrice: {
                ...prev.rentalPrice,
                dailyRate: car.dailyRate,
                totalAmount: calculateTotalAmount(prev.rentalPeriod.startDate, prev.rentalPeriod.endDate, car.dailyRate),
            },
        }));
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
            await createContract(newContract);
            // Handle success, e.g., navigate or show success message
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    };

    // Fetch customers as the user types
    const handleCustomerSearch = async (e) => {
        
        const query = e.target.value;
        setCustomerSearch(query);

        if (query.length > 2) { // Minimum 3 characters before searching
            setLoadingCustomers(true);
            try {
                const results = await searchCustomersByName(query); // API call to search customers
                setCustomerResults(results);
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoadingCustomers(false);
            }
        } else {
            setCustomerResults([]); // Clear results if query is too short
        }
    };

    const handleCustomerSelect = (customer) => {
        setNewContract((prev) => ({ ...prev, customer }));
        setCustomerSearch(customer.name); // Update input field to selected customer name
        setCustomerResults([]); // Clear search results after selection
    };

    return (
        <Modal onClose={onClose}>
            <form onSubmit={handleSubmit} className="create-contract-form">
                {/* Customer Search Field */}
                <label>
                    Search Customer:
                    <input
                        type="text"
                        value={customerSearch}
                        onChange={handleCustomerSearch}
                        placeholder="Enter customer name"
                    />
                    {loadingCustomers && <p>Loading customers...</p>}
                    {customerResults.length > 0 && (
                        <ul className="customer-results-list">
                            {customerResults.map((customer) => (
                                <li key={customer._id} onClick={() => handleCustomerSelect(customer)}>
                                    {customer.name} ({customer.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </label>

                {/* Start and End Date Fields */}
                <label>
                    Start Date:
                    <input
                        type="date"
                        name="rentalPeriod.startDate"
                        value={newContract.rentalPeriod.startDate}
                        onChange={handleDateChange}
                        required
                    />
                </label>
                <label>
                    End Date:
                    <input
                        type="date"
                        name="rentalPeriod.endDate"
                        value={newContract.rentalPeriod.endDate}
                        onChange={handleDateChange}
                        required
                    />
                </label>

                {/* Available cars based on the selected dates */}
                {datesSelected && (
                    <>
                        {loadingCars ? (
                            <p>Loading available cars...</p>
                        ) : (
                            <label>
                                Select Car:
                                <select name="car" onChange={(e) => handleCarSelect(availableCars[e.target.selectedIndex])} required>
                                    <option value="">Select a car</option>
                                    {availableCars.length > 0 ? (
                                        availableCars.map((car) => (
                                            <option key={car._id} value={car._id}>
                                                {car.model} - ${car.dailyRate}/day
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No cars available</option>
                                    )}
                                </select>
                            </label>
                        )}
                    </>
                )}

                {/* Rental Pricing */}
                {newContract.rentalPrice.dailyRate > 0 && (
                    <>
                        <p><strong>Daily Rate:</strong> ${newContract.rentalPrice.dailyRate}</p>
                        <p><strong>Total Amount:</strong> ${newContract.rentalPrice.totalAmount}</p>
                    </>
                )}

                {/* Payment Details */}
                <label>
                    Payment Method:
                    <input
                        type="text"
                        name="paymentDetails.paymentMethod"
                        value={newContract.paymentDetails.paymentMethod}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label>
                    Payment Status:
                    <select
                        name="paymentDetails.paymentStatus"
                        value={newContract.paymentDetails.paymentStatus}
                        onChange={handleChange}
                    >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>
                </label>

                {/* Additional Notes */}
                <label>
                    Additional Notes:
                    <textarea
                        name="additionalNotes"
                        value={newContract.additionalNotes}
                        onChange={handleChange}
                    />
                </label>

                {/* Contract Photo */}
                <label>
                    Contract Photo (URL):
                    <input
                        type="text"
                        name="contractPhoto"
                        value={newContract.contractPhoto}
                        onChange={handleChange}
                    />
                </label>

                {/* Submit Button */}
                <button type="submit" disabled={!datesSelected || !newContract.car._id || !newContract.customer._id}>
                    Create Contract
                </button>
                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
};
