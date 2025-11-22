// Notifications Feature - Public API
// Re-export everything that should be accessible from outside this feature

// Pages
export { default as NotificationsPage } from './pages/NotificationsPage';

// Hooks
export { useNotifications } from './hooks/useNotification';
export { useUnreadCount } from './hooks/useUnreadCount';

// Services
export * from './services/notificationService';

// Types
export type * from './types/notification.types';
