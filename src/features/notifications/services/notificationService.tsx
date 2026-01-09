import { api, encodePathParam } from '@/shared/utils/apiService';

export const getNotifications = async () => {
  return api.get('/api/notifications', 'notifications');
};

export const markAsSeen = async (notificationId: string) => {
  return api.patch(
    `/api/notifications/${encodePathParam(notificationId)}/seen`,
    {},
    'notification',
    notificationId
  );
};

export const markAllAsSeen = async () => {
  return api.patch('/api/notifications/mark-all-seen', {}, 'notifications');
};

export const getUnreadNotifications = async () => {
  return api.get('/api/notifications/unread', 'unread notifications');
};

export const deleteNotification = async (notificationId: string) => {
  return api.delete(
    `/api/notifications/${encodePathParam(notificationId)}`,
    'notification',
    notificationId
  );
};
