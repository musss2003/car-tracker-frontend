import "./UserProfile.css";
import React, { useEffect, useState } from 'react';
import { getUser, updateUser, deleteUser } from '../../../services/userService.js';
import { toast } from "react-toastify";
import defaultAvatar from '../../../assets/default_avatar.png';
import UserEditFields from '../UserEditFields.js'; // Import the new component

const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null); // Start with null for user
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
                toast.error(`Error fetching user: ${error.message}`); // Show error to the user
            }
        };

        fetchUser();
    }, [userId]);

    const handleEdit = (field) => {
        setCurrentEdit(field);
        setEditValue(user[field] || '');
    };

    const handleSave = async () => {
        const updatedData = { [currentEdit]: editValue };
        try {
            await updateUser(userId, updatedData);
            setUser((prevUser) => ({ ...prevUser, ...updatedData }));
            toast.success(`Updated ${currentEdit}`);
            setCurrentEdit(null);
        } catch (error) {
            console.error(`Update failed for ${currentEdit}:`, error);
            toast.error(`Failed to update ${currentEdit}: ${error.message}`);
        }
    };

    const handleDeleteUser = async () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                toast.warning('User deleted');
                setUser(null); // Set user to null after deletion
            } catch (error) {
                console.error('Failed to delete user', error);
                toast.error('Failed to delete user');
            }
        }
    };

    // Date formatter
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (!user) return <div>Loading...</div>; // Handling loading state

    return (
        <div className="max-w-2xl mt-10 mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
                <img src={user.profilePhotoUrl || defaultAvatar} className="w-16 h-16 rounded-full" alt="User Avatar" />
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <button onClick={() => handleEdit("profilePhotoUrl")} className="text-sm text-blue-500 hover:text-blue-700">Edit Photo</button>
            </div>
            {/* New component for edit fields */}
            <UserEditFields
                user={user}
                currentEdit={currentEdit}
                setCurrentEdit={setCurrentEdit}
                editValue={editValue}
                setEditValue={setEditValue}
                handleSave={handleSave}
                formatDate={formatDate} // Pass formatDate to the UserEditFields
                handleEdit={handleEdit} // Pass handleEdit to the UserEditFields
            />
            <button onClick={handleDeleteUser} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded">Delete User</button>
        </div>
    );
};

export default UserProfile;
