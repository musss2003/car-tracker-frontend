import { useState, useEffect } from 'react';
import { logError } from '@/shared/utils/logger';
import { getUnreadNotifications } from '../services/notificationService';
import { socketService } from '../../../shared/services/socketService';

export const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const notifications = await getUnreadNotifications();
        setUnreadCount((notifications as any[]).length);
      } catch (error) {
        logError('Failed to fetch unread count', error);
      }
    };

    fetchUnreadCount();

    // Listen for new notifications via Socket.IO
    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socketService.onNotification(handleNewNotification);

    return () => {
      socketService.offNotification(handleNewNotification);
    };
  }, []);

  const decrementCount = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const resetCount = () => {
    setUnreadCount(0);
  };

  return { unreadCount, decrementCount, resetCount };
};
