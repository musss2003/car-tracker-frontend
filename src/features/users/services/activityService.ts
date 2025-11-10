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

// Send heartbeat to update user activity
export const sendHeartbeat = async (): Promise<void> => {
  try {
    await apiClient.post('/api/activity/heartbeat');
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Heartbeat failed:', error);
  }
};

// Get all users with their online status
export const getUsersWithStatus = async (): Promise<UserWithStatus[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; users: UserWithStatus[] }>('/api/activity/users-status');
    return response.data.users || [];
  } catch (error) {
    console.error('Error fetching users with status:', error);
    throw error;
  }
};
