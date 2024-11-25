import "./UserProfile.css";
import React, { useEffect, useState } from 'react';
import { getUser, updateUser, deleteUser } from '../../../services/userService.js';
import { toast } from "react-toastify";
import defaultAvatar from '../../../assets/default_avatar.png';
import UserEditFields from '../UserEditFields.js'; // Import the new component
import { useAuth } from "../../../contexts/useAuth.js";

const UserProfile = () => {
    const { user } = useAuth();
    const userId = user.id;
    const [eUser, setUser] = useState(null); // Start with null for user
    const [currentEdit, setCurrentEdit] = useState(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser(userId);
                setUser(data);
            } catch (error) {
                // TO DO
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

    if (!eUser) return <div>Loading...</div>; // Handling loading state

    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <img src={eUser.profilePhotoUrl || defaultAvatar} className="user-profile-avatar" alt="User Avatar" />
                <div>
                    <h2 className="user-profile-title">{eUser.name}</h2>
                    <p className="text-gray-600">{eUser.bio || 'No bio available'}</p>
                </div>
                <button onClick={() => handleEdit("profilePhotoUrl")} className="user-profile-edit-button">Edit Photo</button>
            </div>
            <UserEditFields
                user={eUser}
                currentEdit={currentEdit}
                setCurrentEdit={setCurrentEdit}
                editValue={editValue}
                setEditValue={setEditValue}
                handleSave={handleSave}
                formatDate={formatDate} // Pass formatDate to the UserEditFields
                handleEdit={handleEdit} // Pass handleEdit to the UserEditFields
            />
            <button onClick={handleDeleteUser} className="user-profile-delete-button">Delete User</button>
        </div>
    );
};

export default UserProfile;
