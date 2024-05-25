import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import CustomerDetailsModal from '../CustomerDetailsModal/CustomerDetailsModal';
import EditCustomerModal from '../EditCustomerModal.js/EditCustomerModal';

const CustomerCard = ({ customer, onDelete, onEdit }) => {
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleDetailsClick = () => {
        setShowDetailsModal(true);
    };

    const handleEditClick = () => {
        setShowEditModal(true);
    };

    const handleDeleteClick = () => {
        onDelete(customer._id);
    };

    return (
        <>
            <div
                className="customer-card bg-white shadow-lg rounded-lg overflow-hidden m-4 max-w-sm transition-transform transform hover:scale-105 cursor-pointer"
            >
                <div className="p-6" onClick={handleDetailsClick}>
                    <h2 className="text-2xl font-semibold mb-2">{customer.name}</h2>
                    <p className="text-gray-700 mb-1"><strong>Email:</strong> {customer.email}</p>
                    <p className="text-gray-700 mb-1"><strong>Phone:</strong> {customer.phone_number}</p>
                    <p className="text-gray-700 mb-1"><strong>Address:</strong> {customer.address}</p>
                </div>
                <div className="flex justify-end p-4">
                    <button onClick={handleEditClick} className="text-blue-500 hover:text-blue-700 mr-2">
                        <PencilIcon className="w-6 h-6" />
                    </button>
                    <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {showDetailsModal && (
                <CustomerDetailsModal
                    customer={customer}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}

            {showEditModal && (
                <EditCustomerModal
                    customer={customer}
                    onClose={() => setShowEditModal(false)}
                    onEdit={onEdit}
                />
            )}
        </>
    );
};

export default CustomerCard;