import React, { useEffect, useState } from 'react';
import { createAndDownloadContract, deleteContract, downloadContract, getContractsPopulated, updateContract } from '../../../services/contractService';
import './ContractsTable.css';
import { CreateContractForm } from '../../../components/Contract/CreateContractForm/CreateContractForm';
import { toast } from 'react-toastify';
import EditContractForm from '../../../components/Contract/EditContractForm/EditContractForm';
import ContractDetails from '../../../components/Contract/ContractDetails/ContractDetails';
import jsPDF from "jspdf";
import "jspdf-autotable"; // Ensures table support in jsPDF
import * as XLSX from "xlsx";


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

    const totalPages = Math.ceil(contracts.length / contractsPerPage);

    const [sortColumn, setSortColumn] = useState(null); // e.g., "customer.name", "car.model", "rentalPeriod.startDate"
    const [sortOrder, setSortOrder] = useState("asc"); // Can be "asc" for ascending or "desc" for descending

    const sortedContracts = [...contracts].sort((a, b) => {
        let aValue, bValue;

        switch (sortColumn) {
            case "customer.name":
                aValue = a.customer?.name?.toLowerCase() || "";
                bValue = b.customer?.name?.toLowerCase() || "";
                break;
            case "car.model":
                aValue = a.car?.model?.toLowerCase() || "";
                bValue = b.car?.model?.toLowerCase() || "";
                break;
            case "rentalPeriod.startDate":
                aValue = new Date(a.rentalPeriod.startDate);
                bValue = new Date(b.rentalPeriod.startDate);
                break;
            case "rentalPeriod.endDate":
                aValue = new Date(a.rentalPeriod.endDate);
                bValue = new Date(b.rentalPeriod.endDate);
                break;
            default:
                return 0;
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const currentContracts = sortedContracts.slice(indexOfFirstContract, indexOfLastContract);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

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
    }, [searchTerm, filterStatus, contracts.length]);

    const handleDeleteContract = async () => {
        if (!window.confirm("Are you sure you want to delete this contract?")) {
            return;
        }
        try {
            await deleteContract(selectedContract._id);
            await fetchContracts();

            setSelectedContract(null);
            toast.success("Uspješno izbrisan ugovor")
        } catch (error) {
            toast.error(error);
        }
    }

    const handleDownloadContract = async () => {
        try {
            downloadContract(selectedContract._id);
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
            const createdContract = await createAndDownloadContract(newContractData);

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

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Contracts List", 20, 10);
    
        const tableColumn = ["Customer Name", "Passport Number", "Car Model", "License Plate", "Start Date", "End Date", "Status"];
        const tableRows = sortedContracts.map(contract => [
            contract.customer ? contract.customer.name : "N/A",
            contract.customer ? contract.customer.passport_number : "N/A",
            contract.car ? contract.car.model : "N/A",
            contract.car ? contract.car.license_plate : "N/A",
            contract.rentalPeriod.startDate ? new Date(contract.rentalPeriod.startDate).toLocaleDateString() : "N/A",
            contract.rentalPeriod.endDate ? new Date(contract.rentalPeriod.endDate).toLocaleDateString() : "N/A",
            new Date() < new Date(contract.rentalPeriod.startDate) ? "confirmed" :
            (new Date() <= new Date(contract.rentalPeriod.endDate) ? "active" : "completed")
        ]);
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
    
        doc.save("contracts.pdf");
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheetData = sortedContracts.map(contract => ({
            "Customer Name": contract.customer ? contract.customer.name : "N/A",
            "Passport Number": contract.customer ? contract.customer.passport_number : "N/A",
            "Car Model": contract.car ? contract.car.model : "N/A",
            "License Plate": contract.car ? contract.car.license_plate : "N/A",
            "Start Date": contract.rentalPeriod.startDate ? new Date(contract.rentalPeriod.startDate).toLocaleDateString() : "N/A",
            "End Date": contract.rentalPeriod.endDate ? new Date(contract.rentalPeriod.endDate).toLocaleDateString() : "N/A",
            "Status": new Date() < new Date(contract.rentalPeriod.startDate)
                ? "confirmed"
                : new Date() <= new Date(contract.rentalPeriod.endDate)
                    ? "active"
                    : "completed",
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contracts");
        XLSX.writeFile(workbook, "contracts.xlsx");
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="table-container">
            <div className='export-btns'>
                <button onClick={exportToPDF} className="export-pdf-btn">Export to PDF</button>
                <button onClick={exportToExcel} className="export-excel-btn">Export to Excel</button>
            </div>

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
            <div className="overflow-x-auto rounded-lg">
                <table className="contracts-table min-w-full bg-white shadow-lg border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th
                                className="px-6 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort("customer.name")}
                            >Customer Name {sortColumn === "customer.name" && (sortOrder === "asc" ? "↑" : "↓")}</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">Passport Number</th>
                            <th
                                className="px-6 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider cursor-pointer hide-on-small"
                                onClick={() => handleSort("car.model")}
                            >
                                Car Model {sortColumn === "car.model" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider hide-on-small">License Plate</th>
                            <th
                                className="px-6 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider cursor-pointer hide-on-small"
                                onClick={() => handleSort("rentalPeriod.startDate")}
                            >
                                Start Date {sortColumn === "rentalPeriod.startDate" && (sortOrder === "asc" ? "↑" : "↓")}
                            </th>
                            <th
                                className="px-6 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider cursor-pointer hide-on-small"
                                onClick={() => handleSort("rentalPeriod.endDate")}
                            >
                                End Date {sortColumn === "rentalPeriod.endDate" && (sortOrder === "asc" ? <span>↑</span> : <span>↓</span>)}
                            </th>
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

            {selectedContract && <ContractDetails contract={selectedContract} onEdit={handleEdit} onBack={handleCloseDetails} onDelete={handleDeleteContract} onDownload={handleDownloadContract} />}


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