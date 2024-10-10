import React, { useState } from 'react';
import { createContract } from '../../../services/contractService'; 
import './CreateContractForm.css';

export const CreateContractForm = ({ onClose, onCreate }) => {
    const [newContract, setNewContract] = useState({
        contractNumber: '',
        car: { model: '', license_plate: '' },
        customer: { name: '', passport_number: '', email: '' },
        rentalPeriod: { startDate: '', endDate: '' },
        rentalPrice: { dailyRate: '', totalAmount: '' },
        paymentDetails: { paymentMethod: '', paymentStatus: '' },
        additionalNotes: '',
        contractPhoto: ''
    });

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
                    [path[1]]: value
                }
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            await createContract(newContract);
            onCreate(newContract);
            onClose(); // Close modal after creation
        } catch (error) {
            console.error("Error creating contract:", error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Create New Contract</h2>
                <div className="edit-form">
                    <label>
                        Contract Number:
                        <input type="text" name="contractNumber" value={newContract.contractNumber} onChange={handleChange} />
                    </label>
                    <label>
                        Car Model:
                        <input type="text" name="car.model" value={newContract.car.model} onChange={handleChange} />
                    </label>
                    <label>
                        Car License Plate:
                        <input type="text" name="car.license_plate" value={newContract.car.license_plate} onChange={handleChange} />
                    </label>
                    <label>
                        Customer Name:
                        <input type="text" name="customer.name" value={newContract.customer.name} onChange={handleChange} />
                    </label>
                    <label>
                        Passport Number:
                        <input type="text" name="customer.passport_number" value={newContract.customer.passport_number} onChange={handleChange} />
                    </label>
                    <label>
                        Customer Email:
                        <input type="email" name="customer.email" value={newContract.customer.email} onChange={handleChange} />
                    </label>
                    <label>
                        Start Date:
                        <input type="date" name="rentalPeriod.startDate" value={newContract.rentalPeriod.startDate} onChange={handleChange} />
                    </label>
                    <label>
                        End Date:
                        <input type="date" name="rentalPeriod.endDate" value={newContract.rentalPeriod.endDate} onChange={handleChange} />
                    </label>
                    <label>
                        Daily Rate:
                        <input type="number" name="rentalPrice.dailyRate" value={newContract.rentalPrice.dailyRate} onChange={handleChange} />
                    </label>
                    <label>
                        Total Amount:
                        <input type="number" name="rentalPrice.totalAmount" value={newContract.rentalPrice.totalAmount} onChange={handleChange} />
                    </label>
                    <label>
                        Payment Method:
                        <input type="text" name="paymentDetails.paymentMethod" value={newContract.paymentDetails.paymentMethod} onChange={handleChange} />
                    </label>
                    <label>
                        Payment Status:
                        <input type="text" name="paymentDetails.paymentStatus" value={newContract.paymentDetails.paymentStatus} onChange={handleChange} />
                    </label>
                    <label>
                        Additional Notes:
                        <textarea name="additionalNotes" value={newContract.additionalNotes} onChange={handleChange} />
                    </label>
                    <button onClick={handleSubmit}>Create</button>
                </div>
            </div>
        </div>
    );
};
