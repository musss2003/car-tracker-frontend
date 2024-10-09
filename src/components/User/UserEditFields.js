import React from 'react';
import { PencilIcon } from '@heroicons/react/solid';

const UserEditFields = ({ user, currentEdit, setCurrentEdit, editValue, setEditValue, handleSave, formatDate, handleEdit }) => {
    return (
        <div className="space-y-4">
            {Object.keys(user).map((key) => (
                key !== "__v" &&
                key !== "_id" &&
                key !== "password" &&
                key !== "profilePhotoUrl" &&
                key !== "privacySettings" && (
                    <div key={key} className="user-profile-field">
                        <div className="flex-1 min-w-0">
                            <strong className="user-profile-field-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                            <span className="ml-2 truncate block user-profile-field-value">
                                {key === "createdAt" || key === "lastLogin" ? formatDate(user[key]) : user[key] || 'N/A'}
                            </span>
                        </div>
                        {key !== "createdAt" && key !== "lastLogin" && key !== "role" && (
                            <button onClick={() => handleEdit(key)} className="ml-4 user-profile-edit-icon">
                                <PencilIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                )
            ))}
            {currentEdit && (
                <div className="user-profile-modal">
                    <div className="user-profile-modal-content">
                        <h4 className="user-profile-modal-header">Edit {currentEdit}</h4>
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="user-profile-modal-input"
                        />
                        <div className="user-profile-modal-buttons">
                            <button onClick={handleSave} className="user-profile-modal-button user-profile-modal-button-save">Save</button>
                            <button onClick={() => setCurrentEdit(null)} className="user-profile-modal-button user-profile-modal-button-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserEditFields;
