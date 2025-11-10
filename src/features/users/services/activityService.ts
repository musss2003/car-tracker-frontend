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

// Send heartbeat to update user activity (fallback for non-WebSocket clients)
export const sendHeartbeat = async (): Promise<void> => {
  try {
    await apiClient.post('/api/activity/heartbeat');
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('Heartbeat failed:', error);
  }
};

// Get all users with their online status (uses real-time WebSocket data)
export const getUsersWithStatus = async (): Promise<UserWithStatus[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; users: UserWithStatus[] }>('/api/activity/users-status');
    return response.data.users || [];
  } catch (error) {
    console.error('Error fetching users with status:', error);
    throw error;
  }
};

// Get list of currently online user IDs
export const getOnlineUsers = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; onlineUsers: string[] }>('/api/activity/online');
    return response.data.onlineUsers || [];
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
};
