import React, { useEffect, useState } from 'react';
import { getUnreadNotifications } from '../../services/notificationService';
import './Notification.css';
import { Notification } from '../../types/Notification';

interface NotificationProps {
  openDropdown: string | null;
  toggleDropdown: (menu: string) => void;
  registerRef: (el: HTMLLIElement | null) => void;
}

const Notification: React.FC<NotificationProps> = ({
  toggleDropdown,
  openDropdown,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (openDropdown === 'alerts') {
      fetchUnreadNotifications();
    }
  }, [openDropdown]);

  const fetchUnreadNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (err) {
      console.error('Error fetching unread notifications:', err);
    }
  };

  const handleToggle = () => {
    toggleDropdown('alerts');
  };

  return (
    <li className="dropdown">
      <button className="dropdown-toggle" onClick={handleToggle}>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        <i className="fas fa-bell"></i>
      </button>

      {openDropdown === 'alerts' && (
        <div className="dropdown-menu">
          <h6 className="dropdown-header">Alerts Center</h6>

          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`dropdown-item ${
                  notification.status === 'new' ? 'new-alert' : ''
                }`}
              >
                <div
                  className={`icon-circle ${
                    notification.type === 'info'
                      ? 'info'
                      : notification.type === 'warning'
                        ? 'warning'
                        : 'danger'
                  }`}
                >
                  <i className="icon"></i>
                </div>
                <div className="notification-content">
                  <span className="dropdown-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                  <p>{notification.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="dropdown-no-alerts">No notifications available</p>
          )}

          <button className="dropdown-footer">Show All Alerts</button>
        </div>
      )}
    </li>
  );
};

export default Notification;
