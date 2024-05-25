import React, { useState } from 'react';
import { uploadImage } from '../../../services/uploadService.js';
import { addCustomer } from '../../../services/customerService.js';


const AddCustomerModal = ({ onClose, onAdd }) => {
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        driver_license_number: '',
        passport_number: '',
    });
    const [passportPhoto, setPassportPhoto] = useState(null);
    const [drivingLicensePhoto, setDrivingLicensePhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer({ ...newCustomer, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'passportPhoto') {
            setPassportPhoto(files[0]);
        } else if (name === 'drivingLicensePhoto') {
            setDrivingLicensePhoto(files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const passportPhotoUrl = await uploadImage(passportPhoto);
            const drivingLicensePhotoUrl = await uploadImage(drivingLicensePhoto);

            const customerData = {
                ...newCustomer,
                passportPhotoUrl,
                drivingLicensePhotoUrl
            };

            const response = await addCustomer(customerData);
            onAdd(response);
            onClose();
        } catch (error) {
            console.error('Error adding customer:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Add New Customer</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={newCustomer.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={newCustomer.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <input
                        type="text"
                        name="phone_number"
                        placeholder="Phone Number"
                        value={newCustomer.phone_number}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={newCustomer.address}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    <input
                        type="text"
                        name="driver_license_number"
                        placeholder="Driver License Number"
                        value={newCustomer.driver_license_number}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <input
                        type="text"
                        name="passport_number"
                        placeholder="Passport Number"
                        value={newCustomer.passport_number}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <input
                        type="file"
                        name="passportPhoto"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <input
                        type="file"
                        name="drivingLicensePhoto"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                        required
                    />
                    <div className="col-span-full flex justify-end mt-4">
                        <button
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 mr-3 text-white"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4zm2 5.291A7.953 7.953 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                'Add Customer'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomerModal;
