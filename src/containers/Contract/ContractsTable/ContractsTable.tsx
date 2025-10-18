import './ContractsTable.css';
import { useEffect, useState, useMemo } from 'react';
import {
  createAndDownloadContract,
  deleteContract,
  downloadContract,
  getContractsPopulated,
  updateContract,
} from '../../../services/contractService';
import { toast } from 'react-toastify';
import {
  FilterIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckIcon,
} from '@heroicons/react/solid';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // This augments jsPDF prototype
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

import EditContractForm from '../../../components/Contract/EditContractForm/EditContractForm';
import ContractDetails from '../../../components/Contract/ContractDetails/ContractDetails';
import CreateContractForm from '../../../components/Contract/CreateContractForm/CreateContractForm';
import { Contract } from '../../../types/Contract';
import {
  TableContainer,
  TableActions,
  SearchFilter,
  Pagination,
} from '../../../components/ui';

const ContractsTable = () => {
  // State management
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'rentalPeriod.startDate',
    direction: 'desc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch contracts data
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await getContractsPopulated();
      setContracts(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
      setError('Failed to load contracts. Please try again later.');
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    // First, filter the contracts
    let result = [...contracts];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (contract) =>
          contract.customer?.name?.toLowerCase().includes(lowerSearchTerm) ||
          contract.customer?.passportNumber?.includes(searchTerm) ||
          contract.car?.model?.toLowerCase().includes(lowerSearchTerm) ||
          contract.car?.license_plate?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      const now = new Date();
      result = result.filter((contract) => {
        const startDate = new Date(contract.rentalPeriod.startDate);
        const endDate = new Date(contract.rentalPeriod.endDate);

        switch (filterStatus) {
          case 'confirmed':
            return now < startDate;
          case 'active':
            return now >= startDate && now <= endDate;
          case 'completed':
            return now > endDate;
          default:
            return true;
        }
      });
    }

    // Then, sort the filtered results
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: string | number | Date = '';
        let bValue: string | number | Date = '';

        // Handle nested properties
        if (sortConfig.key.includes('.')) {
          const [obj, prop] = sortConfig.key.split('.');

          if (obj === 'customer' && a.customer && b.customer) {
            aValue = (a.customer as any)[prop] ?? '';
            bValue = (b.customer as any)[prop] ?? '';
          } else if (obj === 'car' && a.car && b.car) {
            aValue = (a.car as any)[prop] ?? '';
            bValue = (b.car as any)[prop] ?? '';
          } else if (obj === 'rentalPeriod') {
            aValue = new Date((a.rentalPeriod as any)[prop]);
            bValue = new Date((b.rentalPeriod as any)[prop]);
          }
        } else {
          aValue = (a as any)[sortConfig.key] ?? '';
          bValue = (b as any)[sortConfig.key] ?? '';
        }

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [contracts, searchTerm, filterStatus, sortConfig]);

  // Pagination logic
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContracts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedContracts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedContracts.length / itemsPerPage
  );

  // Event handlers
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewingDetails(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsViewingDetails(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedContract(null);
  };

  const handleSave = async (updatedContract: Contract) => {
    try {
      setLoading(true);
      if (updatedContract.id) {
        await updateContract(updatedContract.id, updatedContract);
      } else {
        throw new Error('Contract ID is undefined');
      }
      await fetchContracts();
      toast.success('Contract updated successfully');
      setIsEditing(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Failed to update contract');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (newContractData: Contract) => {
    try {
      setLoading(true);
      const createdContract = await createAndDownloadContract(newContractData);
      await fetchContracts();
      toast.success('Contract created successfully');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      setLoading(true);
      if (selectedContract?.id) {
        await deleteContract(selectedContract.id);
      } else {
        toast.error('No contract selected or contract ID is missing.');
      }
      await fetchContracts();
      toast.success('Contract deleted successfully');
      setSelectedContract(null);
      setIsViewingDetails(false);
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (contract: Contract): number => {
    const startDate = new Date(contract.rentalPeriod.startDate);
    const endDate = new Date(contract.rentalPeriod.endDate);

    // Calculate the number of rental days
    const rentalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate the total price
    const dailyRate =
      typeof contract.car.price_per_day === 'string'
        ? parseFloat(contract.car.price_per_day)
        : contract.car.price_per_day;

    return rentalDays * dailyRate;
  };

  const handleDownloadContract = async () => {
    try {
      if (selectedContract?.id) {
        await downloadContract(selectedContract.id);
      } else {
        toast.error('No contract selected or contract ID is missing.');
      }
      toast.success('Contract download initiated');
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Failed to download contract');
    }
  };

  const handleCloseDetails = () => {
    setSelectedContract(null);
    setIsViewingDetails(false);
    setIsEditing(false);
  };

  // Export functions
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Contracts List', 20, 10);

      const tableColumn = [
        'Customer Name',
        'Passport Number',
        'Car Model',
        'License Plate',
        'Start Date',
        'End Date',
        'Status',
      ];
      const tableRows = filteredAndSortedContracts.map((contract) => {
        const now = new Date();
        const startDate = new Date(contract.rentalPeriod.startDate);
        const endDate = new Date(contract.rentalPeriod.endDate);

        let status;
        if (now < startDate) {
          status = 'Confirmed';
        } else if (now >= startDate && now <= endDate) {
          status = 'Active';
        } else {
          status = 'Completed';
        }

        return [
          contract.customer?.name || 'N/A',
          contract.customer?.passportNumber || 'N/A',
          contract.car?.model || 'N/A',
          contract.car?.license_plate || 'N/A',
          startDate.toLocaleDateString(),
          endDate.toLocaleDateString(),
          status,
        ];
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [66, 135, 245] },
      });

      doc.save('contracts.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const worksheetData = filteredAndSortedContracts.map((contract) => {
        const now = new Date();
        const startDate = new Date(contract.rentalPeriod.startDate);
        const endDate = new Date(contract.rentalPeriod.endDate);

        let status;
        if (now < startDate) {
          status = 'Confirmed';
        } else if (now >= startDate && now <= endDate) {
          status = 'Active';
        } else {
          status = 'Completed';
        }

        return {
          'Customer Name': contract.customer?.name || 'N/A',
          'Passport Number': contract.customer?.passportNumber || 'N/A',
          'Car Model': contract.car?.model || 'N/A',
          'License Plate': contract.car?.license_plate || 'N/A',
          'Start Date': startDate.toLocaleDateString(),
          'End Date': endDate.toLocaleDateString(),
          'Total Price': contract ? `$${calculateTotalPrice(contract)}` : 'N/A',
          Status: status,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contracts');
      XLSX.writeFile(workbook, 'contracts.xlsx');
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel');
    }
  };

  // Helper function to determine contract status
  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const startDate = new Date(contract.rentalPeriod.startDate);
    const endDate = new Date(contract.rentalPeriod.endDate);

    if (now < startDate) {
      return { status: 'confirmed', className: 'status-confirmed' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', className: 'status-active' };
    } else {
      return { status: 'completed', className: 'status-completed' };
    }
  };

  // Render table header with sort indicators
  const renderTableHeader = (
    label: string,
    key: string,
    additionalClass = ''
  ) => {
    const isSorted = sortConfig.key === key;
    const SortIcon =
      sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
      <th
        className={`table-heading ${additionalClass}`}
        onClick={() => handleSort(key)}
      >
        <div className="header-content">
          <span>{label}</span>
          {isSorted ? (
            <SortIcon className="sort-icon active" />
          ) : (
            <SortAscendingIcon className="sort-icon" />
          )}
        </div>
      </th>
    );
  };

  // Render status badge
  const renderStatusBadge = (status: string, className: string) => {
    let icon;
    switch (status) {
      case 'confirmed':
        icon = <ClockIcon className="status-icon" />;
        break;
      case 'active':
        icon = <CheckCircleIcon className="status-icon" />;
        break;
      case 'completed':
        icon = <CheckIcon className="status-icon" />;
        break;
      default:
        icon = null;
    }

    return (
      <div className={`status-badge ${className}`}>
        {icon}
        <span className="status-text">{status}</span>
      </div>
    );
  };

  return (
    <TableContainer>
      <TableActions
        onCreateClick={() => setIsCreating(true)}
        createLabel="Create New Contract"
        loading={loading}
        showExport={true}
        onExportPDF={exportToPDF}
        onExportExcel={exportToExcel}
      />

      <div className="contracts-table-custom-controls">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={(value) => setSearchTerm(value)}
          placeholder="Search by customer, passport, or car..."
        />

        <div className="filter-container">
          <FilterIcon className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="contracts-error-message">
          <XIcon className="error-icon" />
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="contracts-loading-indicator">
          <div className="contracts-spinner"></div>
          <span>Loading contracts...</span>
        </div>
      )}

      {/* Contracts table */}
      <div className="contracts-table-wrapper">
        <table className="contracts-table">
          <thead>
            <tr>
              {renderTableHeader('Customer', 'customer.name')}
              {renderTableHeader(
                'Passport',
                'customer.passport_number',
                'hide-on-small'
              )}
              {renderTableHeader('Car', 'car.model')}
              {renderTableHeader(
                'License Plate',
                'car.license_plate',
                'hide-on-small'
              )}
              {renderTableHeader(
                'Start Date',
                'rentalPeriod.startDate',
                'hide-on-small'
              )}
              {renderTableHeader(
                'End Date',
                'rentalPeriod.endDate',
                'hide-on-small'
              )}
              {renderTableHeader('Status', 'status')}
              <th className="table-heading actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContracts.length > 0 ? (
              paginatedContracts.map((contract, index) => {
                const { status, className } = getContractStatus(contract);

                return (
                  <tr key={contract.id || index} className="contract-row">
                    <td className="contracts-table-cell">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {contract.customer?.name?.charAt(0) || '?'}
                        </div>
                        <div className="customer-name">
                          {contract.customer?.name || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="contracts-table-cell hide-on-small">
                      {contract.customer?.passportNumber || 'N/A'}
                    </td>
                    <td className="contracts-table-cell">
                      {contract.car?.model || 'N/A'}
                    </td>
                    <td className="contracts-table-cell hide-on-small">
                      {contract.car?.license_plate || 'N/A'}
                    </td>
                    <td className="contracts-table-cell hide-on-small">
                      {contract.rentalPeriod.startDate
                        ? new Date(
                            contract.rentalPeriod.startDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="contracts-table-cell hide-on-small">
                      {contract.rentalPeriod.endDate
                        ? new Date(
                            contract.rentalPeriod.endDate
                          ).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="contracts-table-cell">
                      {renderStatusBadge(status, className)}
                    </td>
                    <td className="contracts-table-cell actions-cell">
                      <div className="contracts-action-buttons">
                        <button
                          className="contracts-action-btn view"
                          onClick={() => handleContractClick(contract)}
                          title="View Details"
                        >
                          <EyeIcon className="contracts-action-icon" />
                        </button>
                        <button
                          className="contracts-action-btn edit"
                          onClick={() => {
                            setSelectedContract(contract);
                            handleEdit();
                          }}
                          title="Edit Contract"
                        >
                          <PencilIcon className="contracts-action-icon" />
                        </button>
                        <button
                          className="contracts-action-btn download"
                          onClick={() => {
                            setSelectedContract(contract);
                            handleDownloadContract();
                          }}
                          title="Download Contract"
                        >
                          <DocumentDownloadIcon className="contracts-action-icon" />
                        </button>
                        <button
                          className="contracts-action-btn delete"
                          onClick={() => {
                            setSelectedContract(contract);
                            handleDeleteContract();
                          }}
                          title="Delete Contract"
                        >
                          <TrashIcon className="contracts-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="empty-table-message">
                  {searchTerm || filterStatus !== 'all'
                    ? 'No contracts match your search criteria'
                    : 'No contracts available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredAndSortedContracts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      {isViewingDetails && selectedContract && (
        <div className="contracts-modal-overlay">
          <div className="modal-content">
            <ContractDetails
              contract={selectedContract}
              onEdit={handleEdit}
              onBack={handleCloseDetails}
              onDelete={handleDeleteContract}
              onDownload={handleDownloadContract}
            />
          </div>
        </div>
      )}

      {isEditing && selectedContract && (
        <div className="contracts-modal-overlay">
          <div className="modal-content">
            <EditContractForm
              contract={selectedContract}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {isCreating && (
        <div className="contracts-modal-overlay">
          <div className="modal-content">
            <CreateContractForm
              onSave={handleCreateContract}
              onClose={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}
    </TableContainer>
  );
};

export default ContractsTable;
