'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  addCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../../../services/customerService';
import { toast } from 'react-toastify';
import {
  SearchIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  UserAddIcon,
  DownloadIcon,
} from '@heroicons/react/solid';
import './CustomersTable.css';
import CustomerDetails from '../../../components/Customer/CustomerDetails/CustomerDetails';
import EditCustomerForm from '../../../components/Customer/EditCustomerForm/EditCustomerForm';
import CreateCustomerForm from '../../../components/Customer/CreateCustomerForm/CreateCustomerForm';
import * as XLSX from 'xlsx';
import { Customer } from '../../../types/Customer';

const CustomersTable = () => {
  // State management
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer;
    direction: 'asc' | 'desc';
  }>({
    key: 'name',
    direction: 'asc',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Fetch customers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCustomers();
        setCustomers(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch customers:', err);
        setError('Failed to load customers. Please try again later.');
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    // First, filter the customers
    let result = [...customers];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (customer) =>
          (customer.name &&
            customer.name.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.driver_license_number &&
            customer.driver_license_number.includes(searchTerm)) ||
          (customer.passport_number &&
            customer.passport_number.includes(searchTerm)) ||
          (customer.email &&
            customer.email.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.phone_number && customer.phone_number.includes(searchTerm))
      );
    }

    // Then, sort the filtered results
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];

        // Handle null or undefined values
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Fallback if types mismatch
        return 0;
      });
    }

    return result;
  }, [customers, searchTerm, sortConfig]);

  // Pagination logic
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCustomers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredAndSortedCustomers.length / itemsPerPage
  );

  // Event handlers
  const handleSort = (key: keyof Customer) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this customer?'
    );
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      await deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      setSelectedCustomer(null);
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedCustomer: Customer) => {
    try {
      setLoading(true);
      const response = await updateCustomer(
        updatedCustomer.id ?? '',
        updatedCustomer
      );
      setCustomers(customers.map((c) => (c.id === response.id ? response : c)));
      setIsEditing(false);
      toast.success('Customer updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (newCustomer: Customer) => {
    try {
      setLoading(true);
      const response = await addCustomer(newCustomer);
      setCustomers([...customers, response]);
      setIsCreating(false);
      toast.success('Customer added successfully');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setIsEditing(true);
    setEditCustomer(customer);
    setSelectedCustomer(null);
  };

  const closeEditForm = () => {
    setIsEditing(false);
    setEditCustomer(null);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      const worksheetData = filteredAndSortedCustomers.map((customer) => ({
        Name: customer.name || 'N/A',
        'Driver License': customer.driver_license_number || 'N/A',
        'Passport Number': customer.passport_number || 'N/A',
        Email: customer.email || 'N/A',
        Phone: customer.phone_number || 'N/A',
        Address: customer.address || 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
      XLSX.writeFile(workbook, 'customers.xlsx');
      toast.success('Excel exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel');
    }
  };

  // Render table header with sort indicators
  const renderTableHeader = (label: string, key: keyof Customer) => {
    const isSorted = sortConfig.key === key;
    const SortIcon =
      sortConfig.direction === 'asc' ? SortAscendingIcon : SortDescendingIcon;

    return (
      <th className="customer-table-heading" onClick={() => handleSort(key)}>
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

  // If a form or details view is active, show only that
  if (isCreating) {
    return (
      <div className="overlay-container">
        <div className="form-container">
          <CreateCustomerForm
            onSave={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      </div>
    );
  }

  if (isEditing && editCustomer) {
    return (
      <div className="overlay-container">
        <div className="form-container">
          <EditCustomerForm
            customer={editCustomer}
            onSave={handleSave}
            onCancel={closeEditForm}
          />
        </div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="overlay-container">
        <div className="details-container">
          <CustomerDetails
            customer={selectedCustomer}
            onEdit={() => handleEdit(selectedCustomer)}
            onDelete={() =>
              selectedCustomer?.id && handleDelete(selectedCustomer.id)
            }
            onClose={closeCustomerDetails}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="customer-list-container">
      {/* Table controls */}
      <div className="table-controls">
        <div className="left-controls">
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            <UserAddIcon className="btn-icon" />
            Add New Customer
          </button>

          <button className="export-btn" onClick={exportToExcel}>
            <DownloadIcon className="btn-icon" />
            Export to Excel
          </button>
        </div>

        <div className="right-controls">
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <XIcon className="clear-icon" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <ExclamationCircleIcon className="error-icon" />
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading customers...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && customers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-container">
            <UserAddIcon className="empty-icon" />
          </div>
          <h3>No Customers Found</h3>
          <p>Get started by adding your first customer</p>
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            Add New Customer
          </button>
        </div>
      )}

      {/* Customer table */}
      {!loading && customers.length > 0 && (
        <div className="table-wrapper">
          <table className="customer-table">
            <thead className="customer-table-header">
              <tr>
                {renderTableHeader('Name', 'name')}
                {renderTableHeader('Driver License', 'driver_license_number')}
                {renderTableHeader('Passport Number', 'passport_number')}
                {renderTableHeader('Email', 'email')}
                {renderTableHeader('Phone', 'phone_number')}
                <th className="customer-table-heading actions-column">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="customer-table-body">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer, index) => (
                  <tr key={customer.id || index} className="customer-table-row">
                    <td className="customer-table-cell">
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.name
                            ? customer.name.charAt(0).toUpperCase()
                            : '?'}
                        </div>
                        <span>{customer.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="customer-table-cell">
                      {customer.driver_license_number || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.passport_number || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.phone_number || 'N/A'}
                    </td>
                    <td className="customer-table-cell actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          title="View Details"
                          aria-label="View customer details"
                        >
                          <EyeIcon className="action-icon" />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(customer);
                          }}
                          title="Edit Customer"
                          aria-label="Edit customer"
                        >
                          <PencilIcon className="action-icon" />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.id ?? '');
                          }}
                          title="Delete Customer"
                          aria-label="Delete customer"
                        >
                          <TrashIcon className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-table-message">
                    No customers match your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredAndSortedCustomers.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedCustomers.length
            )}{' '}
            of {filteredAndSortedCustomers.length} customers
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="pagination-icon" />
            </button>

            <span className="pagination-page">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="pagination-icon" />
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>

          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="items-per-page-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;
