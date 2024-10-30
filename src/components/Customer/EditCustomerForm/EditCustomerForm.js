// EditCustomerForm.js
import React, { useState, useEffect } from 'react';
import './EditCustomerForm.css';

const EditCustomerForm = ({ customer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        email: '',
        phone_number: '',
        address: '',
        driver_license_number: '',
        passport_number: '',
        drivingLicensePhotoUrl: '',
        passportPhotoUrl: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                _id: customer._id,
                name: customer.name,
                email: customer.email || '',
                phone_number: customer.phone_number || '',
                address: customer.address || '',
                driver_license_number: customer.driver_license_number,
                passport_number: customer.passport_number,
                drivingLicensePhotoUrl: customer.drivingLicensePhotoUrl || '',
                passportPhotoUrl: customer.passportPhotoUrl || ''
            });
        }
    }, [customer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form className="edit-customer-form" onSubmit={handleSubmit}>
            <h2>Edit Customer</h2>

            <label>
                Name:
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
                Email:
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </label>
            <label>
                Phone:
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </label>
            <label>
                Address:
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </label>
            <label>
                Driver License:
                <input type="text" name="driver_license_number" value={formData.driver_license_number} onChange={handleChange} required />
            </label>
            <label>
                Passport Number:
                <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} required />
            </label>
            <label>
                Driver License Photo URL:
                <input type="text" name="drivingLicensePhotoUrl" value={formData.drivingLicensePhotoUrl} onChange={handleChange} />
            </label>
            <label>
                Passport Photo URL:
                <input type="text" name="passportPhotoUrl" value={formData.passportPhotoUrl} onChange={handleChange} />
            </label>

            <div className="form-actions">
                <button type="submit" className="save-button">Save</button>
                <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default EditCustomerForm;
