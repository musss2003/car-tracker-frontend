import "./UserProfile.css";
import React, { useEffect, useState } from 'react';
import { getUser, updateUser, deleteUser } from '../../../services/userService.js';
import { toast } from "react-toastify";
import defaultAvatar from '../../../assets/default_avatar.png';
import UserEditFields from '../UserEditFields.js'; // Import the new component

const UserProfile = ({ id }) => {

    const [user, setUser] = useState(null); // Start with null for user
    const [currentEdit, setCurrentEdit] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser(id);
                setUser(data);
            } catch (error) {
                // TO DO
            }
        };

        fetchUser();
    }, [id]);

    const handleEdit = (field) => {
        setCurrentEdit(field);
        setEditValue(user[field] || '');
    };

    const handleSave = async () => {
        const updatedData = { [currentEdit]: editValue };
        try {
            await updateUser(id, updatedData);
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
                await deleteUser(id);
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
        <div className="user-profile-container">
            <div className="user-profile-header">
                <img src={user.profilePhotoUrl || defaultAvatar} className="user-profile-avatar" alt="User Avatar" />
                <div>
                    <h2 className="user-profile-title">{user.name}</h2>
                    <p className="text-gray-600">{user.bio || 'No bio available'}</p>
                </div>
                <button onClick={() => handleEdit("profilePhotoUrl")} className="user-profile-edit-button">Edit Photo</button>
            </div>
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
        </div>
    );
};

export default UserProfile;
