import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Clock,
  FileText,
  User,
  Settings,
  Car,
} from 'lucide-react';
import {
  getNotifications,
  markAsSeen,
  markAllAsSeen,
  deleteNotification,
} from '../services/notificationService';
import { Notification } from '../types/notification.types';
import { socketService } from '../../../shared/services/socketService';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'unread' | 'read';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socketService.onNotification(handleNewNotification);

    return () => {
      // Cleanup socket listener
      socketService.offNotification(handleNewNotification);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSeen = async (id: string) => {
    try {
      await markAsSeen(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, status: 'seen' } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark as seen:', err);
    }
  };

  const handleMarkAllAsSeen = async () => {
    try {
      await markAllAsSeen();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: 'seen' as const }))
      );
    } catch (err) {
      console.error('Failed to mark all as seen:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as seen when clicked
    if (notification.status === 'new' && notification.id) {
      handleMarkAsSeen(notification.id);
    }

    // Navigate based on notification type
    const type = notification.type.toLowerCase();
    if (type.includes('contract')) {
      navigate('/contracts');
    } else if (type.includes('car')) {
      navigate('/cars');
    } else if (type.includes('customer')) {
      navigate('/customers');
    } else if (type.includes('user')) {
      navigate('/users');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return notif.status === 'new';
    if (filter === 'read') return notif.status === 'seen';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.status === 'new').length;

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('contract')) return <FileText className="w-5 h-5" />;
    if (lowerType.includes('car')) return <Car className="w-5 h-5" />;
    if (lowerType.includes('user')) return <User className="w-5 h-5" />;
    if (lowerType.includes('system')) return <Settings className="w-5 h-5" />;
    return <Bell className="w-5 h-5" />;
  };

  // Get color for notification type
  const getNotificationColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('expiring') || lowerType.includes('urgent')) {
      return 'text-red-600 bg-red-50';
    }
    if (lowerType.includes('new') || lowerType.includes('contract')) {
      return 'text-blue-600 bg-blue-50';
    }
    if (lowerType.includes('user')) {
      return 'text-green-600 bg-green-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsSeen}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-6 border-t pt-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {filter === 'unread'
                ? "You don't have any unread notifications"
                : filter === 'read'
                  ? "You don't have any read notifications"
                  : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                  notification.status === 'new'
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Type Badge */}
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>

                          {/* Message */}
                          <p
                            className={`mt-2 text-sm cursor-pointer ${
                              notification.status === 'new'
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-700'
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            {notification.message}
                          </p>

                          {/* Time */}
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        {notification.status === 'new' && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {notification.status === 'new' && notification.id && (
                          <button
                            onClick={() => handleMarkAsSeen(notification.id!)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Mark as Read
                          </button>
                        )}
                        {notification.id && (
                          <button
                            onClick={() => handleDelete(notification.id!)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
