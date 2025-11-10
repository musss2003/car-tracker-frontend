import apiClient from '@/shared/utils/apiClient';
import { User } from '../types/user.types';
import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';

const BASE_URL = '/api/users';
const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/';

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'employee' | 'user';
  citizenshipId?: string;
  sendCredentials?: boolean;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  email?: string;
  role?: 'admin' | 'employee' | 'user';
  citizenshipId?: string;
  profilePhotoUrl?: string;
  phone?: string;
  address?: string;
}

/**
 * Get all users (admin only)
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<{ success: boolean; data: User[] }>(
    BASE_URL
  );
  return response.data.data;
};

/**
 * Get user by ID
 * @alias getUserById - For compatibility with UserProfile component
 */
export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<{ success: boolean; data: User }>(
    `${BASE_URL}/${id}`
  );
  return response.data.data;
};

/**
 * Get user by ID (alias for getUser)
 */
export const getUserById = async (id: string): Promise<User> => {
  return getUser(id);
};

/**
 * Create new user (admin only)
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await apiClient.post<{ success: boolean; data: User }>(
    BASE_URL,
    userData
  );
  return response.data.data;
};

/**
 * Update user (admin only)
 */
export const updateUser = async (
  id: string,
  userData: UpdateUserData
): Promise<User> => {
  const response = await apiClient.put<{ success: boolean; data: User }>(
    `${BASE_URL}/${id}`,
    userData
  );
  return response.data.data;
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

/**
 * Reset user password (admin only)
 */
export const resetUserPassword = async (
  id: string,
  newPassword: string,
  sendEmail: boolean = true
): Promise<void> => {
  await apiClient.post(`${BASE_URL}/${id}/reset-password`, {
    newPassword,
    sendEmail,
  });
};

/**
 * Change user password (requires current password verification)
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await apiClient.put(`${BASE_URL}/${userId}/password`, {
    currentPassword,
    newPassword,
  });
};

/**
 * Upload user profile photo
 */
export const uploadProfilePhoto = async (userId: string, photoFile: File): Promise<User> => {
  const formData = new FormData();
  formData.append('document', photoFile);

  // First upload the file
  const uploadResponse = await fetch(`${API_URL}upload/upload`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload profile photo');
  }

  const uploadResult = await uploadResponse.json();
  const filename = uploadResult.filename;

  // Then update the user with the photo URL
  const updatedUser = await updateUser(userId, {
    profilePhotoUrl: filename,
  });

  return updatedUser;
};
