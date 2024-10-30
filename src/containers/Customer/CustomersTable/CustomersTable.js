import React, { useState, useEffect } from 'react';
import { addCustomer, deleteCustomer, getCustomers, updateCustomer } from '../../../services/customerService';
import './CustomersTable.css';
import CustomerDetails from '../../../components/Customer/CustomerDetails/CustomerDetails';
import Modal from '../../../components/Modal/Modal';
import EditCustomerForm from '../../../components/Customer/EditCustomerForm/EditCustomerForm';



const CustomersTable = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({ name: '', driver_license_number: '', passport_number: '' });

    // Fetch customers
    useEffect(() => {
        const fetchData = async () => {
            const response = await getCustomers();
            setCustomers(response);
        };
        fetchData();
    }, []);

    // Delete a customer
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!confirmDelete) {
            return;
        }
        await deleteCustomer(id);
        setSelectedCustomer(null);
        setCustomers(customers.filter(c => c._id !== id));
    };

    const handleSave = async (updatedCustomer) => {
        console.log(updatedCustomer);
        const response = await updateCustomer(updatedCustomer._id, updatedCustomer);
        setCustomers(customers.map((c) => (c._id === response._id ? response : c)));
        setIsEditing(false);
    }

    const handleEdit = () => {
        setIsEditing(true);
        setEditCustomer(selectedCustomer);
        setSelectedCustomer(null);
    }    

    const closeEditModal = () => {
        setIsEditing(false);
        setEditCustomer(null);
    } // Close edit modal
    

    const closeCustomerDetails = () => {
        setSelectedCustomer(null); // Close customer details modal
    }

    if (!customers) {
        return <div>Loading...</div>;
    }

    return (
        <div className="customer-list-container">
            {/* Customer List */}
            <table className="customer-table">
                <thead className="customer-table-header">
                    <tr>
                        <th className="customer-table-heading">Name</th>
                        <th className="customer-table-heading">Driver License</th>
                        <th className="customer-table-heading">Passport Number</th>
                    </tr>
                </thead>
                <tbody className="customer-table-body">
                    {customers.map((customer) => (
                        <tr key={customer._id} onClick={() => setSelectedCustomer(customer)} className="customer-table-row">
                            <td className="customer-table-cell">{customer.name}</td>
                            <td className="customer-table-cell">{customer.driver_license_number}</td>
                            <td className="customer-table-cell">{customer.passport_number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {isEditing && (
                <Modal onClose={closeEditModal}>
                    <EditCustomerForm
                        customer={editCustomer}
                        onSave={handleSave} // Function to handle saving the edited customer
                        onCancel={() => setIsEditing(false)} // Function to close the modal without saving
                    />
                </Modal>
            )}

            {selectedCustomer && (
                <Modal onClose={closeCustomerDetails}>
                    <CustomerDetails
                        customer={selectedCustomer}
                        onEdit={() => handleEdit(selectedCustomer)}
                        onDelete={() => handleDelete(selectedCustomer._id)}
                    />
                </Modal>
            )}

            
        </div>

    );
};

export default CustomersTable;
