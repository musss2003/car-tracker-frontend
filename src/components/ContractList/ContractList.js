import React, { useEffect, useState } from 'react';
import { getContracts } from '../../services/contractService';
import { PencilIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';
import './ContractList.css';

const ContractList = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const data = await getContracts();
                setContracts(data);
            } catch (error) {
                console.error('Error fetching contracts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="contract-list-container">
            <h2 className="contract-list-title">Rental Contracts</h2>
            <div className="contract-list">
                {contracts.map((contract) => (
                    <div key={contract._id} className="contract-card">
                        <div className="contract-card-header">
                            <h3 className="contract-card-title">Contract #{contract.contractNumber}</h3>
                            <span className={`status-badge ${contract.status}`}>{contract.status}</span>
                        </div>
                        <div className="contract-card-body">
                            <p><strong>Customer:</strong> {contract.customer}</p>
                            <p><strong>Car:</strong> {contract.car}</p>
                            <p><strong>Rental Period:</strong> {new Date(contract.rentalPeriod.startDate).toLocaleDateString()} - {new Date(contract.rentalPeriod.endDate).toLocaleDateString()}</p>
                            <p><strong>Daily Rate:</strong> ${contract.rentalPrice.dailyRate}</p>
                            <p><strong>Total Amount:</strong> ${contract.rentalPrice.totalAmount}</p>
                            <p><strong>Status:</strong> {contract.status}</p>
                            <p><strong>Payment Method:</strong> {contract.paymentDetails.paymentMethod}</p>
                            <p><strong>Payment Status:</strong> {contract.paymentDetails.paymentStatus}</p>
                            {contract.additionalNotes && <p><strong>Notes:</strong> {contract.additionalNotes}</p>}
                        </div>
                        <div className="contract-card-footer">
                            <button className="edit-button">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button className="delete-button">
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContractList;
