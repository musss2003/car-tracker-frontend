// ContractDetailsModal.js
import React, { useState } from 'react';
import { deleteContract, updateContract } from '../../../services/contractService';
import './ContractDetailsModal.css';

export const ContractDetailsModal = ({ contract, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedContract, setUpdatedContract] = useState({ ...contract });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const path = name.split('.'); // Handle nested fields like `rentalPeriod.startDate`
        
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await updateContract(updatedContract);
            onUpdate(updatedContract);
            setIsEditing(false); // Exit editing mode after save
        } catch (error) {
            console.error("Error updating contract:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteContract(contract._id);
            onClose(); // Close modal after deletion
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
                        <label>
                            Contract Number:
                            <input type="text" name="contractNumber" value={updatedContract.contractNumber} onChange={handleChange} />
                        </label>
                        <label>
                            Car Model:
                            <input type="text" name="car.model" value={updatedContract.car ? updatedContract.car.model : ''} onChange={handleChange} />
                        </label>
                        <label>
                            Car License Plate:
                            <input type="text" name="car.license_plate" value={updatedContract.car ? updatedContract.car.license_plate : ''} onChange={handleChange} />
                        </label>
                        <label>
                            Customer Name:
                            <input type="text" name="customer.name" value={updatedContract.customer ? updatedContract.customer.name : ''} onChange={handleChange} />
                        </label>
                        <label>
                            Passport Number:
                            <input type="text" name="customer.passport_number" value={updatedContract.customer ? updatedContract.customer.passport_number : ''} onChange={handleChange} />
                        </label>
                        <label>
                            Customer Email:
                            <input type="email" name="customer.email" value={updatedContract.customer ? updatedContract.customer.email : ''} onChange={handleChange} />
                        </label>
                        <label>
                            Start Date:
                            <input type="date" name="rentalPeriod.startDate" value={new Date(updatedContract.rentalPeriod.startDate).toISOString().split('T')[0]} onChange={handleChange} />
                        </label>
                        <label>
                            End Date:
                            <input type="date" name="rentalPeriod.endDate" value={new Date(updatedContract.rentalPeriod.endDate).toISOString().split('T')[0]} onChange={handleChange} />
                        </label>
                        <label>
                            Daily Rate:
                            <input type="number" name="rentalPrice.dailyRate" value={updatedContract.rentalPrice.dailyRate} onChange={handleChange} />
                        </label>
                        <label>
                            Total Amount:
                            <input type="number" name="rentalPrice.totalAmount" value={updatedContract.rentalPrice.totalAmount} onChange={handleChange} />
                        </label>
                        <label>
                            Payment Method:
                            <input type="text" name="paymentDetails.paymentMethod" value={updatedContract.paymentDetails.paymentMethod} onChange={handleChange} />
                        </label>
                        <label>
                            Payment Status:
                            <input type="text" name="paymentDetails.paymentStatus" value={updatedContract.paymentDetails.paymentStatus} onChange={handleChange} />
                        </label>
                        <label>
                            Additional Notes:
                            <textarea name="additionalNotes" value={updatedContract.additionalNotes} onChange={handleChange} />
                        </label>
                        <button onClick={handleSave}>Save</button>
                    </div>
                ) : (
                    <div className="details-view">
                        <p><strong>Contract Number:</strong> {contract.contractNumber}</p>
                        <p><strong>Customer Name:</strong> {contract.customer ? contract.customer.name : 'N/A'}</p>
                        <p><strong>Customer Email:</strong> {contract.customer ? contract.customer.email : 'N/A'}</p>
                        <p><strong>Passport Number:</strong> {contract.customer ? contract.customer.passport_number : 'N/A'}</p>
                        <p><strong>Car Model:</strong> {contract.car ? contract.car.model : 'N/A'}</p>
                        <p><strong>Car License Plate:</strong> {contract.car ? contract.car.license_plate : 'N/A'}</p>
                        <p><strong>Start Date:</strong> {new Date(contract.rentalPeriod.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(contract.rentalPeriod.endDate).toLocaleDateString()}</p>
                        <p><strong>Daily Rate:</strong> ${contract.rentalPrice.dailyRate}</p>
                        <p><strong>Total Amount:</strong> ${contract.rentalPrice.totalAmount}</p>
                        <p><strong>Payment Method:</strong> {contract.paymentDetails.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> {contract.paymentDetails.paymentStatus}</p>
                        <p><strong>Status:</strong> {contract.status}</p>
                        <p><strong>Additional Notes:</strong> {contract.additionalNotes}</p>
                        <img src={contract.contractPhoto} alt="Contract" style={{ maxWidth: '100%', margin: '10px 0' }} />
                        <button onClick={handleEdit}>Edit</button>
                        <button onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};
