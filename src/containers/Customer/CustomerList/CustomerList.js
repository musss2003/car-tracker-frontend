import React, { useState, useEffect, useCallback } from 'react';
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer
} from '../../../services/customerService';
import CustomerCard from '../../../components/Customer/CustomerCard/CustomerCard';
import AddCustomerModal from '../../../components/Customer/AddCustomerModal/AddCustomerModal';
import { toast } from "react-toastify";
import ConfirmationModal from '../../../components/UtilsComponent/ConfirmationModal/ConfirmationModal';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('name');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const customersPerPage = 10;

    const fetchCustomers = useCallback(async (page = currentPage) => {
        try {
            const response = await getCustomers({
                page: page,
                limit: customersPerPage,
                searchTerm: searchTerm,
                sortField: sortField
            });
            setCustomers(response.customers);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setError('Error fetching customers');
        }
    }, [currentPage, searchTerm, sortField, customersPerPage]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleSort = (e) => {
        setSortField(e.target.value);
        setCurrentPage(1); // Reset to first page on new sort
    };

    const handleAddCustomer = async (newCustomer) => {
        try {
            await addCustomer(newCustomer);
            fetchCustomers(); // Refresh the list after adding a new customer
            setShowModal(false);
            toast.success('Customer added successfully');
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('Error adding customer');
        }
    };

    const handleEditCustomer = async (id, updatedData) => {
        try {
            await updateCustomer(id, updatedData);
            fetchCustomers(); // Refresh the list after editing a customer
            setShowModal(false);
            toast.success('Customer updated successfully');
        } catch (error) {
            console.error('Error updating customer:', error);
            setError('Error updating customer');
        }
    };

    const handleDeleteCustomer = (customer) => {
        setCustomerToDelete(customer);
        setIsConfirmationModalOpen(true);
    };

    const confirmDeleteCustomer = async () => {
        try {
            await deleteCustomer(customerToDelete._id);
            fetchCustomers(); // Refresh the list after deleting a customer
            setIsConfirmationModalOpen(false);
            toast.success('Customer deleted successfully');
        } catch (error) {
            console.error('Error deleting customer:', error);
            setError('Error deleting customer');
        }
    };

    const cancelDeleteCustomer = () => {
        setIsConfirmationModalOpen(false);
        setCustomerToDelete(null);
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <div className="customer-list p-6 text-center mb-10">
            <h1 className="text-3xl font-bold mb-6">Customer List</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex mb-4 space-x-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="flex-1 p-2 border border-gray-300 rounded"
                />
                <select value={sortField} onChange={handleSort} className="flex-1 p-2 border border-gray-300 rounded">
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="phone_number">Sort by Phone</option>
                    <option value="address">Sort by Address</option>
                </select>
            </div>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600 transition"
                onClick={() => setShowModal(true)}
            >
                Add New Customer
            </button>
            <div className="flex flex-wrap justify-center">
                {customers.map(customer => (
                    <CustomerCard
                        key={customer._id}
                        customer={customer}
                        onDelete={() => handleDeleteCustomer(customer)}
                        onEdit={handleEditCustomer}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
            {showModal && <AddCustomerModal onClose={() => setShowModal(false)} onAdd={handleAddCustomer} />}
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                message={`Are you sure you want to delete ${customerToDelete?.name}?`}
                onConfirm={confirmDeleteCustomer}
                onCancel={cancelDeleteCustomer}
            />
        </div>
    );
};

export default CustomerList;
