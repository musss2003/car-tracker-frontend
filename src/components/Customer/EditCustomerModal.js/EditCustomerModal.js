import React, { useState } from 'react';
import { EyeIcon } from '@heroicons/react/outline';
import { uploadImage } from '../../../services/uploadService';
import './EditCustomerModal.css';

const EditCustomerModal = ({ customer, onClose, onEdit }) => {
    const [formData, setFormData] = useState({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number,
        address: customer.address,
        driver_license_number: customer.driver_license_number,
        passport_number: customer.passport_number,
        passportPhotoUrl: customer.passportPhotoUrl,
        drivingLicensePhotoUrl: customer.drivingLicensePhotoUrl
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = async (e) => {
        const { name, files } = e.target;
        if (files.length === 0) return;

        setIsLoading(true);


        try {
            const response = await uploadImage(files[0]);
            setFormData(prevState => ({ ...prevState, [name]: response }));
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onEdit(customer._id, formData);
    };

    const viewImage = (url) => {
        window.open(url, '_blank');
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-full overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit Customer</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="inline-form-group">
                        <label htmlFor="name" className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="inline-form-group">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="inline-form-group">
                        <label htmlFor="phone_number" className="block text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            name="phone_number"
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="inline-form-group">
                        <label htmlFor="address" className="block text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Address"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="inline-form-group">
                        <label htmlFor="driver_license_number" className="block text-gray-700">Driver License Number</label>
                        <input
                            type="text"
                            name="driver_license_number"
                            id="driver_license_number"
                            value={formData.driver_license_number}
                            onChange={handleChange}
                            placeholder="Driver License Number"
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="inline-form-group">
                        <label htmlFor="passport_number" className="block text-gray-700">Passport Number</label>
                        <input
                            type="text"
                            name="passport_number"
                            id="passport_number"
                            value={formData.passport_number}
                            onChange={handleChange}
                            placeholder="Passport Number"
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div className="inline-form-group">
                        <label className="block text-gray-700">Passport Photo</label>
                        <div className="image-preview">
                            {formData.passportPhotoUrl ? (
                                <>
                                    <img src={formData.passportPhotoUrl} alt="Passport" className="w-10 h-10 rounded" />
                                    <EyeIcon className="w-6 h-6 text-blue-500 image-icon" onClick={() => viewImage(formData.passportPhotoUrl)} />
                                </>
                            ) : (
                                <EyeIcon className="w-6 h-6 text-gray-500" />
                            )}
                        </div>
                        <input
                            type="file"
                            name="passportPhotoUrl"
                            onChange={handleImageUpload}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="inline-form-group">
                        <label className="block text-gray-700">Driving License Photo</label>
                        <div className="image-preview">
                            {formData.drivingLicensePhotoUrl ? (
                                <>
                                    <img src={formData.drivingLicensePhotoUrl} alt="Driving License" className="w-10 h-10 rounded" />
                                    <EyeIcon className="w-6 h-6 text-blue-500 image-icon" onClick={() => viewImage(formData.drivingLicensePhotoUrl)} />
                                </>
                            ) : (
                                <EyeIcon className="w-6 h-6 text-gray-500" />
                            )}
                        </div>
                        <input
                            type="file"
                            name="drivingLicensePhotoUrl"
                            onChange={handleImageUpload}
                            className="p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomerModal;
