import React, { useEffect, useState } from 'react';
import { createContract, deleteContract, getContractsPopulated, updateContract } from '../../../services/contractService';
import './ContractsTable.css';
import { CreateContractForm } from '../../../components/Contract/CreateContractForm/CreateContractForm';
import { toast } from 'react-toastify';
import EditContractForm from '../../../components/Contract/EditContractForm/EditContractForm';
import ContractDetails from '../../../components/Contract/ContractDetails/ContractDetails';

const ContractsTable = () => {
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

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
    }, [contracts]);

    const handleDeleteContract = async () => {
        try{
            await deleteContract(selectedContract._id);
            await fetchContracts();

            setSelectedContract(null);
            toast.success("Uspješno izbrisan ugovor")
        }catch(error){
            toast.error(error);
        }
    }

    const handleContractClick = (contract) => {
        setSelectedContract(contract);
    };

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedContract(null);
    }
    const handleSave = async (updatedContract) => {
        await updateContract(updatedContract._id, updatedContract);

        await fetchContracts();
        toast.success("Uspješno ažuriran ugovor");
        setIsEditing(false);
    };

    const handleCreateContract = async (newContractData) => {
        console.log(newContractData);
        try {
            const createdContract = await createContract(newContractData);

            setContracts([...contracts, createdContract]);
            toast.success("Uspješno kreiran ugovor");
        } catch (error) {
            console.error('Error creating contract:', error);
        }
    };

    const handleCloseDetails = () => {
        setSelectedContract(null);
        setIsEditing(false);
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="table-container">
            <button className="create-btn" onClick={() => setCreateModalOpen(true)}>Create New Contract</button>
            <div className="overflow-x-auto">
                <table className="contracts-table min-w-full bg-white shadow-lg border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">Passport Number</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">Car Model</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">License Plate</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">Start Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">End Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.map(contract => (
                            <tr key={contract._id} onClick={() => handleContractClick(contract)}>
                                <td className="px-6 py-4">{contract.customer ? contract.customer.name : 'N/A'}</td>
                                <td className="px-6 py-4 hide-on-small">{contract.customer ? contract.customer.passport_number : 'N/A'}</td>
                                <td className="px-6 py-4 hide-on-small">{contract.car ? contract.car.model : 'N/A'}</td>
                                <td className="px-6 py-4 hide-on-small">{contract.car ? contract.car.license_plate : 'N/A'}</td>
                                <td className="px-6 py-4 hide-on-small">{contract.rentalPeriod.startDate ? new Date(contract.rentalPeriod.startDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 hide-on-small">{contract.rentalPeriod.endDate ? new Date(contract.rentalPeriod.endDate).toLocaleDateString() : 'N/A'}</td>
                                <td className={`px-6 py-4 ${new Date() < new Date(contract.rentalPeriod.startDate)
                                    ? 'status-confirmed'
                                    : new Date() >= new Date(contract.rentalPeriod.startDate) && new Date() <= new Date(contract.rentalPeriod.endDate)
                                        ? 'status-active'
                                        : 'status-completed'
                                    }`}>
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
            </div>

            {isEditing && (

                <EditContractForm
                    contract={selectedContract}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

            )}

            {selectedContract && <ContractDetails contract={selectedContract} onEdit={handleEdit} onBack={handleCloseDetails} onDelete={handleDeleteContract} />}


            {isCreateModalOpen && (
                <CreateContractForm
                    onSave={handleCreateContract}
                    onClose={() => setCreateModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ContractsTable;