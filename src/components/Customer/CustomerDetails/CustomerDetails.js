// CustomerDetails.js
import React from 'react';
import './CustomerDetails.css';

const CustomerDetails = ({ customer, onEdit, onDelete }) => {
    return (
        <div className="customer-details-container">
            <h2 className="customer-details-title">Customer Details</h2>
            
            <div className="customer-info">
                <div className="info-section">
                    <p><span>Name:</span> {customer.name}</p>
                    <p><span>Email:</span> {customer.email || 'N/A'}</p>
                    <p><span>Phone:</span> {customer.phone_number || 'N/A'}</p>
                    <p><span>Address:</span> {customer.address || 'N/A'}</p>
                </div>
                <div className="info-section">
                    <p><span>Driver License:</span> {customer.driver_license_number}</p>
                    <p><span>Passport Number:</span> {customer.passport_number}</p>
                </div>
            </div>

            <div className="document-section">
                <div className="document">
                    <h3>Driver License Photo</h3>
                    <img src={customer.drivingLicensePhotoUrl} alt="Driver License" className="document-photo" />
                </div>
                <div className="document">
                    <h3>Passport Photo</h3>
                    <img src={customer.passportPhotoUrl} alt="Passport" className="document-photo" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="edit-button" onClick={onEdit}>Edit</button>
                <button className="delete-button" onClick={onDelete}>Delete</button>
            </div>
        </div>
    );
};

export default CustomerDetails;
