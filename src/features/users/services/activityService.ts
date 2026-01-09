import { api } from '@/shared/utils/apiService';

export interface UserWithStatus {
  id: string;
  name?: string;
  username: string;
  email: string;
  role: 'admin' | 'employee' | 'user';
  profilePhotoUrl?: string;
  lastActiveAt?: string;
  lastLogin?: string;
  isOnline: boolean;
}

// Get all users with their online status (uses real-time WebSocket data)
export const getUsersWithStatus = async (): Promise<UserWithStatus[]> => {
  const response = await api.get<{ success: boolean; users: UserWithStatus[] }>(
    '/activity/users-status',
    'user activity'
  );
  return response.users || [];
};
