import React, { useEffect, useState } from 'react'
import { getNotifications, markAllAsSeen, markAsSeen } from '../../../services/notificationService';
import './NotificationList.css';


function NotificationList() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            const notificationsData = await getNotifications();
            setNotifications(notificationsData);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsSeen = async (notificationId) => {
        try {
            const updatedNotification = await markAsSeen(notificationId);

            // Update the notification status locally
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, status: "seen" } : notif
                )
            );
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleMarkAllAsSeen = async () => {
        try {
            await markAllAsSeen();
            // Update all notifications locally
            setNotifications((prev) =>
                prev.map((notif) => ({ ...notif, status: "seen" }))
            );
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="notifications-page">
            <h1>Your Notifications</h1>
            <button
                onClick={handleMarkAllAsSeen}
                disabled={loading}
                className="mark-all-button"
            >
                Mark All as Read
            </button>
            {loading && <p className="loading-text">Loading notifications...</p>}
            {error && <p className="error-text">{error}</p>}
            {!loading && notifications.length === 0 && (
                <p className="no-notifications-text">No notifications found</p>
            )}
            <ul className="notifications-list">
                {notifications.map((notif) => (
                    <li className="notification-item" key={notif._id}>
                        <p className="notification-type">
                            <strong>Type:</strong> {notif.type}
                        </p>
                        <p className="notification-message">
                            <strong>Message:</strong> {notif.message}
                        </p>
                        <p className="notification-status">
                            <strong>Status:</strong>{" "}
                            {notif.status === "new" ? (
                                <span className="status-new">New</span>
                            ) : (
                                <span className="status-seen">Seen</span>
                            )}
                        </p>
                        <p className="notification-created-at">
                            <strong>Created At:</strong>{" "}
                            {new Date(notif.createdAt).toLocaleString()}
                        </p>
                        {notif.status === "new" && (
                            <button
                                onClick={() => handleMarkAsSeen(notif._id)}
                                className="mark-as-seen-button"
                            >
                                Mark as Seen
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default NotificationList
