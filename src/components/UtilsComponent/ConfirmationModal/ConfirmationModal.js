// ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4">
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
