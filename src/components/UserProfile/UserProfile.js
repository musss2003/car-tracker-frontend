import "./UserProfile.css";
import React, { useEffect, useState } from 'react';
import { getUser, updateUser, deleteUser } from '../../services/userService';
import { toast } from "react-toastify";
import { PencilIcon } from '@heroicons/react/solid';
import defaultAvatar from '../../assets/default_avatar.png';

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState({
        username: '',
        email: '',
        name: '',
        profilePhotoUrl: '',
        citizenshipId: '',
        lastLogin: '',
        role: '',
        createdAt: '',
    });
    const [error, setError] = useState(null);
    const [currentEdit, setCurrentEdit] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser(userId);
                setUser(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUser();
    }, [userId]);

    const handleEdit = (field) => {
        setCurrentEdit(field);
        setEditValue(user[field]);
    }

    const handleSave = async () => {
        const updatedData = { [currentEdit]: editValue };
        try {
            const response = await updateUser(userId, updatedData);
            setUser(prevUser => ({ ...prevUser, ...updatedData }));
            toast.success(`Updated ${currentEdit}`);
            setCurrentEdit(null);
        } catch (error) {
            console.error(`Update failed for ${currentEdit}:`, error);
            toast.error(`Failed to update ${currentEdit}`);
        }
    };

    const handleCancel = () => {
        setCurrentEdit(null);
    };

    const handleDeleteUser = async () => {
        try {
            await deleteUser(userId);
            toast.warning('User deleted');
            setUser(null);
        } catch (error) {
            console.error('Failed to delete user', error);
            toast.error('Failed to delete user');
        }
    };

    // Date formatter
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
                <img src={user.profilePhotoUrl || defaultAvatar} className="w-16 h-16 rounded-full" alt="User Avatar" />
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <button onClick={() => handleEdit("profilePhotoUrl")} className="text-sm text-blue-500 hover:text-blue-700">Edit Photo</button>
            </div>
            <div className="space-y-3">
                {Object.keys(user).map(key => (
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
            </div>
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
                            <button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
