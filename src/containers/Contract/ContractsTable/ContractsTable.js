// ContractsTable.js
import React, { useEffect, useState } from 'react';
import { createContract, getContractsPopulated } from '../../../services/contractService';
import './ContractsTable.css';
import { ContractDetailsModal } from '../../../components/Contract/ContractDetailsModal/ContractDetailsModal';
import { CreateContractForm } from '../../../components/Contract/CreateContractForm/CreateContractForm';

const ContractsTable = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState(null);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false); // To manage Create Modal state


    const fetchContracts = async () => {
        try {
            const data = await getContractsPopulated();
            setContracts(data);
        } catch (err) {
            setError('Failed to fetch contracts');
            console.error(err);
        }
    };

    useEffect(() => {

        fetchContracts();
    }, []);

    const handleContractClick = (contract) => {
        setSelectedContract(contract);
    };

    const handleCloseContractDetailsModal = () => {
        setSelectedContract(null);
        fetchContracts();
    };

    const handleUpdateContract = (updatedContract) => {
        setContracts((prevContracts) =>
            prevContracts.map((contract) =>
                contract._id === updatedContract._id ? updatedContract : contract
            )
        );
    };

    const handleCreateContract = async (newContractData) => {
        try {
            const createdContract = await createContract(newContractData);
            setContracts([...contracts, createdContract]); // Add new contract to the list
            setCreateModalOpen(false); // Close modal
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    };

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        fetchContracts();
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="table-container">
            <button className="create-btn" onClick={() => setCreateModalOpen(true)}>Create New Contract</button>

            <table className="table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Passport Number</th>
                        <th>Car Model</th>
                        <th>License Plate</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map(contract => (
                        <tr key={contract._id} onClick={() => handleContractClick(contract)}>
                            <td>{contract.customer ? contract.customer.name : 'N/A'}</td>
                            <td>{contract.customer ? contract.customer.passport_number : 'N/A'}</td>
                            <td>{contract.car ? contract.car.model : 'N/A'}</td>
                            <td>{contract.car ? contract.car.license_plate : 'N/A'}</td>
                            <td>{contract.rentalPeriod.startDate ? new Date(contract.rentalPeriod.startDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{contract.rentalPeriod.endDate ? new Date(contract.rentalPeriod.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td className={
                                new Date() < new Date(contract.rentalPeriod.startDate)
                                    ? 'status-confirmed' // Confirmed
                                    : new Date() >= new Date(contract.rentalPeriod.startDate) && new Date() <= new Date(contract.rentalPeriod.endDate)
                                        ? 'status-active' // Active
                                        : 'status-completed' // Completed
                            }>
                                {
                                    new Date() < new Date(contract.rentalPeriod.startDate)
                                        ? 'confirmed'
                                        : new Date() >= new Date(contract.rentalPeriod.startDate) && new Date() <= new Date(contract.rentalPeriod.endDate)
                                            ? 'active'
                                            : 'completed'
                                }
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedContract && (
                <ContractDetailsModal
                    contract={selectedContract}
                    onClose={handleCloseContractDetailsModal}
                    onUpdate={handleUpdateContract}
                />
            )}

            {isCreateModalOpen && (
                <CreateContractForm
                    onSave={handleCreateContract}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ContractsTable;
