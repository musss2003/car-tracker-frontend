import apiClient from '@/shared/utils/apiClient';

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
  try {
    const response = await apiClient.get<{
      success: boolean;
      users: UserWithStatus[];
    }>('/api/activity/users-status');
    return response.data.users || [];
  } catch (error) {
    console.error('Error fetching users with status:', error);
    throw error;
  }
};
