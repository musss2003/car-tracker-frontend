import React from 'react';
import { PencilIcon } from '@heroicons/react/solid';
import { toast } from "react-toastify";

const UserEditFields = ({ user, currentEdit, setCurrentEdit, editValue, setEditValue, handleSave, formatDate, handleEdit }) => {
    return (
        <div className="space-y-3">
            {Object.keys(user).map((key) => (
                key !== "__v" &&
                key !== "_id" &&
                key !== "password" &&
                key !== "profilePhotoUrl" &&
                key !== "privacySettings" && (
                    <div key={key} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                            <span className="ml-2 truncate block">
                                {key === "createdAt" || key === "lastLogin" ? formatDate(user[key]) : user[key] || 'N/A'}
                            </span>
                        </div>
                        {key !== "createdAt" && key !== "lastLogin" && key !== "role" && (
                            <button onClick={() => handleEdit(key)} className="ml-4 text-blue-500 hover:text-blue-700">
                                <PencilIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                )
            ))}
            {currentEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-4 w-96">
                        <h4 className="text-lg mb-4">Edit {currentEdit}</h4>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full"
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">Save</button>
                            <button onClick={() => setCurrentEdit(null)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserEditFields;
