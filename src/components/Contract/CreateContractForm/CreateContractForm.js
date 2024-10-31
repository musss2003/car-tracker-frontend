import React, { useState } from 'react';
import { getAvailableCarsForPeriod } from '../../../services/carService';
import { searchCustomersByName } from '../../../services/customerService'; // New service for customer search
import './CreateContractForm.css';
import Modal from '../../Modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

export const CreateContractForm = ({ onClose, onSave }) => {
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
        const { startDate, endDate } = {
            ...newContract.rentalPeriod,
            [name.split('.')[1]]: value,
        };

        // Validate that end date is not earlier than start date
        if (name === "rentalPeriod.endDate" && new Date(value) < new Date(startDate)) {
            alert('End date cannot be earlier than start date');
            return;
        }

        if (name === "rentalPeriod.startDate" && endDate && new Date(endDate) < new Date(value)) {
            alert('Start date cannot be later than end date');
            return;
        }

        setNewContract((prev) => ({
            ...prev,
            rentalPeriod: {
                ...prev.rentalPeriod,
                [name.split('.')[1]]: value,
            },
        }));

        // Fetch cars only when both dates are valid and selected
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
            setNewContract((prev) => ({
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
            onSave(newContract);
            // Handle success, e.g., navigate or show success message
            onClose();
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
                <div className="customer-search">
                    <label>Search Customer:</label>
                    <input
                        type="text"
                        value={customerSearch}
                        onChange={handleCustomerSearch}
                        placeholder="Enter customer name"
                        required
                    />
                    {loadingCustomers && <p>Loading customers...</p>}
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

                <div className="date-picker">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="rentalPeriod.startDate"
                        value={newContract.rentalPeriod.startDate}
                        onChange={handleDateChange}
                        required
                    />

                    <label>End Date:</label>
                    <input
                        type="date"
                        name="rentalPeriod.endDate"
                        value={newContract.rentalPeriod.endDate}
                        onChange={handleDateChange}
                        required
                    />
                </div>

                <div className="car-select">
                    {datesSelected && (
                        <>
                            <label>Select Car:</label>
                            <select
                                name="car"
                                value={newContract.car._id || ""}
                                onChange={(e) => handleCarSelect(e.target.value)} // Pass the selected car's _id
                                required
                            >
                                <option value="">Select a car</option>
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
                {newContract.rentalPrice.dailyRate > 0 && (
                    <>
                        <p><strong>Daily Rate:</strong> ${newContract.rentalPrice.dailyRate}</p>
                        <p><strong>Total Amount:</strong> ${newContract.rentalPrice.totalAmount}</p>
                    </>
                )}

                {/* Additional Notes */}
                <label>
                    Additional Notes:
                    <textarea
                        name="additionalNotes"
                        value={newContract.additionalNotes}
                        onChange={handleChange}
                        rows={4} // Set a default number of rows for better visibility
                        placeholder="Enter any additional notes here..." // Placeholder for guidance
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
                        placeholder="Enter photo URL..." // Placeholder for guidance
                    />
                </label>

                {/* Submit Button */}
                <button type="submit" disabled={!datesSelected || !newContract.car._id || !newContract.customer._id} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faCar} style={{ marginRight: '5px' }} />
                    Create Contract
                </button>
                <button type="button" onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Cancel
                </button>
            </form>
        </Modal>
    );
};
