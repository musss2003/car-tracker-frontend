import { getAuthHeaders } from '@/shared/utils/getAuthHeaders';

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/notifications/';

export const getNotifications = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error((err as Error).message || 'Something went wrong');
    throw err;
  }
};

export const markAsSeen = async (notificationId: string) => {
  try {
    const response = await fetch(`${API_URL}${notificationId}/seen`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as seen');
    }

    return await response.json();
  } catch (err) {
    console.error((err as Error).message);
    throw err;
  }
};

export const markAllAsSeen = async () => {
  try {
    const response = await fetch(`${API_URL}mark-all-seen`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as seen');
    }

    return await response.json();
  } catch (err) {
    console.error((err as Error).message);
    throw err;
  }
};

export const getUnreadNotifications = async () => {
  try {
    const response = await fetch(`${API_URL}unread`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread notifications');
    }

    const data = await response.json();
    return data.notifications;
  } catch (err) {
    console.error((err as Error).message || 'Something went wrong');
    throw err;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await fetch(`${API_URL}${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return await response.json();
  } catch (err) {
    console.error((err as Error).message);
    throw err;
  }
};
