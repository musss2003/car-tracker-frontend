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
      } catch (err) {
        console.error("Failed to load customers!");
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
          (customer.driverLicenseNumber &&
            customer.driverLicenseNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.passportNumber &&
            customer.passportNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.email &&
            customer.email.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.phoneNumber && customer.phoneNumber.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.address &&
            customer.address.toLowerCase().includes(lowerSearchTerm)) ||
          (customer.countryOfOrigin &&
            customer.countryOfOrigin.toLowerCase().includes(lowerSearchTerm))
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
      'Jeste li sigurni da želite izbrisati ovog korisnika?'
    );
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      await deleteCustomer(id);
      setCustomers(customers.filter((c) => c.id !== id));
      setSelectedCustomer(null);
      toast.success('Korisnik uspješno izbrisan');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Neuspješno izbrisan korisnik');
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
      toast.success('Korisnik uspješno ažuriran!');
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Neuspješno ažuriranje korisnika!');
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
      toast.success('Korisnici uspješno dodani!');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Neuspješno dodavanje korisnika!');
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
        'Ime': customer.name || 'N/A',
        'Vozačka dozvola': customer.driverLicenseNumber || 'N/A',
        'Broj pasoša': customer.passportNumber || 'N/A',
        'Email': customer.email || 'N/A',
        'Telefon': customer.phoneNumber || 'N/A',
        'Adresa': customer.address || 'N/A',
        'Zemlja porijekla': customer.countryOfOrigin || 'N/A',
        'Datum kreiranja': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Korisnici');
      XLSX.writeFile(workbook, 'korisnici.xlsx');
      toast.success('Excel uspješno izvezen');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Excel neuspješno izvezen');
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
            Dodaj novog korisnika
          </button>

          <button className="export-btn" onClick={exportToExcel}>
            <DownloadIcon className="btn-icon" />
            Izvezi u Excel
          </button>
        </div>

        <div className="right-controls">
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Pretraži korisnike..."
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

      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Učitavanje korisnika...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && customers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-container">
            <UserAddIcon className="empty-icon" />
          </div>
          <h3>Nema pronađenih korisnika</h3>
          <p>Počnite dodavanjem vašeg prvog korisnika</p>
          <button className="create-btn" onClick={() => setIsCreating(true)}>
            Dodaj novog korisnika
          </button>
        </div>
      )}

      {/* Customer table */}
      {!loading && customers.length > 0 && (
        <div className="table-wrapper">
          <table className="customer-table">
            <thead className="customer-table-header">
              <tr>
                {renderTableHeader('Ime', 'name')}
                {renderTableHeader('Vozačka dozvola', 'driverLicenseNumber')}
                {renderTableHeader('Broj pasoša', 'passportNumber')}
                {renderTableHeader('Email', 'email')}
                {renderTableHeader('Telefon', 'phoneNumber')}
                {renderTableHeader('Zemlja', 'countryOfOrigin')}
                <th className="customer-table-heading actions-column">
                  Akcije
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
                      {customer.driverLicenseNumber || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.passportNumber || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.phoneNumber || 'N/A'}
                    </td>
                    <td className="customer-table-cell">
                      {customer.countryOfOrigin || 'N/A'}
                    </td>
                    <td className="customer-table-cell actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          title="Prikaži detalje"
                          aria-label="Prikaži detalje korisnika"
                        >
                          <EyeIcon className="action-icon" />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(customer);
                          }}
                          title="Uredi korisnika"
                          aria-label="Uredi korisnika"
                        >
                          <PencilIcon className="action-icon" />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(customer.id ?? '');
                          }}
                          title="Izbriši korisnika"
                          aria-label="Izbriši korisnika"
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
                    Nema korisnika koji odgovaraju vašim kriterijima pretrage
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
            Prikazano {(currentPage - 1) * itemsPerPage + 1} do{' '}
            {Math.min(
              currentPage * itemsPerPage,
              filteredAndSortedCustomers.length
            )}{' '}
            od {filteredAndSortedCustomers.length} korisnika
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              Prva
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="pagination-icon" />
            </button>

            <span className="pagination-page">
              Stranica {currentPage} od {totalPages}
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
              Zadnja
            </button>
          </div>

          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Stavki po stranici:</label>
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
