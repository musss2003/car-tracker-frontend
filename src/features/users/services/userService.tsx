import { getAuthHeaders } from "@/shared/utils/getAuthHeaders";
import { User } from "../types/user.types";


const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

// Get user by ID
export const getUser = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}users/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error fetching user: ${error.message}`);
    throw error;
  }
};

// Update user by ID
export const updateUser = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}users/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Error updating user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error updating user: ${error.message}`);
    throw error;
  }
};

// Delete user by ID
export const deleteUser = async (
  userId: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error deleting user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error deleting user: ${error.message}`);
    throw error;
  }
};

// Upload user profile photo
// Function accepts a File, creates FormData inside
export const uploadProfilePhoto = async (userId: string, photoFile: File) => {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const response = await fetch(`${API_URL}users/${userId}/photo`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile photo');
  }

  return response.json();
};
