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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'confirmed', 'active', 'completed'
    const [currentPage, setCurrentPage] = useState(1);
    const contractsPerPage = 10; // Customize this as needed

    const indexOfLastContract = currentPage * contractsPerPage;
    const indexOfFirstContract = indexOfLastContract - contractsPerPage;
    const currentContracts = contracts.slice(indexOfFirstContract, indexOfLastContract);
    const totalPages = Math.ceil(contracts.length / contractsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    const fetchContracts = async () => {
        try {
            const data = await getContractsPopulated();

            const filteredContracts = data.filter(contract => {
                const matchesSearch = contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contract.customer?.passport_number.includes(searchTerm) ||
                    contract.car?.model.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = filterStatus === 'all' ||
                    (filterStatus === 'confirmed' && new Date() < new Date(contract.rentalPeriod.startDate)) ||
                    (filterStatus === 'active' && new Date() >= new Date(contract.rentalPeriod.startDate) && new Date() <= new Date(contract.rentalPeriod.endDate)) ||
                    (filterStatus === 'completed' && new Date() > new Date(contract.rentalPeriod.endDate));
                return matchesSearch && matchesStatus;
            });
            setContracts(filteredContracts);
        } catch (err) {
            setError('Failed to fetch contracts');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, [searchTerm, filterStatus, contracts]);

    const handleDeleteContract = async () => {
        try {
            await deleteContract(selectedContract._id);
            await fetchContracts();

            setSelectedContract(null);
            toast.success("Uspješno izbrisan ugovor")
        } catch (error) {
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
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by customer name, passport number, or car model"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="status-filter"
                >
                    <option value="all">All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
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
                        {currentContracts.map(contract => (
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

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
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