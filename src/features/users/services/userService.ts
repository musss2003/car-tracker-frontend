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
}

/**
 * Get all users (admin only)
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<{ success: boolean; data: User[] }>(BASE_URL);
  return response.data.data;
};

/**
 * Get user by ID
 * @alias getUserById - For compatibility with UserProfile component
 */
export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<{ success: boolean; data: User }>(`${BASE_URL}/${id}`);
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
  const response = await apiClient.post<{ success: boolean; data: User }>(BASE_URL, userData);
  return response.data.data;
};

/**
 * Update user (admin only)
 */
export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
  const response = await apiClient.put<{ success: boolean; data: User }>(`${BASE_URL}/${id}`, userData);
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
export const resetUserPassword = async (id: string, newPassword: string, sendEmail: boolean = true): Promise<void> => {
  await apiClient.post(`${BASE_URL}/${id}/reset-password`, { newPassword, sendEmail });
};

/**
 * Upload user profile photo
 */
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
