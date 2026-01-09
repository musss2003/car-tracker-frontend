import { api, encodePathParam, apiRequest } from '@/shared/utils/apiService';
import { User } from '../types/user.types';

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
  return api.get<User[]>('/api/users', 'users');
};

/**
 * Get user by ID
 * @alias getUserById - For compatibility with UserProfile component
 */
export const getUser = async (id: string): Promise<User> => {
  return api.get<User>(`/api/users/${encodePathParam(id)}`, 'user', id);
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
  return api.post<User>('/api/users', userData, 'user');
};

/**
 * Update user (admin only)
 */
export const updateUser = async (
  id: string,
  userData: UpdateUserData
): Promise<User> => {
  return api.put<User>(
    `/api/users/${encodePathParam(id)}`,
    userData,
    'user',
    id
  );
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (id: string): Promise<void> => {
  return api.delete<void>(`/api/users/${encodePathParam(id)}`, 'user', id);
};

/**
 * Reset user password (admin only)
 */
export const resetUserPassword = async (
  id: string,
  newPassword: string,
  sendEmail: boolean = true
): Promise<void> => {
  await api.post<void>(
    `/api/users/${encodePathParam(id)}/reset-password`,
    { newPassword, sendEmail },
    'user password',
    id
  );
};

/**
 * Change user password (requires current password verification)
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.put<void>(
    `/api/users/${encodePathParam(userId)}/password`,
    { currentPassword, newPassword },
    'user password',
    userId
  );
};

/**
 * Upload user profile photo
 */
export const uploadProfilePhoto = async (
  userId: string,
  photoFile: File
): Promise<User> => {
  const formData = new FormData();
  formData.append('document', photoFile);

  // Upload the file using apiRequest with FormData support
  const uploadResult = await apiRequest<{ filename: string }>(
    '/api/upload/upload',
    {
      method: 'POST',
      body: formData,
      resourceName: 'profile photo',
      operation: 'upload',
    }
  );

  // Update the user with the photo URL
  return updateUser(userId, {
    profilePhotoUrl: uploadResult.filename,
  });
};
