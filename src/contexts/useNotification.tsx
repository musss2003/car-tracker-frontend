import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const NotificationContext = createContext();

const API_URL = process.env.REACT_APP_API_BASE_URL;

export const NotificationProvider = ({ children, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Establish Socket.IO connection
        const newSocket = io(API_URL); // Adjust to your server's URL
        setSocket(newSocket);

        // Join the user's room
        newSocket.emit('join', userId);

        // Listen for new notifications
        newSocket.on('new-notification', (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        return () => newSocket.disconnect();
    }, [userId]);

    // Fetch notifications from the server
    const fetchNotifications = async () => {
        try {
            const response = await axios.get(API_URL + `/api/notifications/${userId}`);
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Mark a notification as read
    const markAsRead = async (id) => {
        try {
            await axios.patch(API_URL + `/api/notifications/${id}`, { status: 'seen' });
            setNotifications((prev) =>
                prev.map((notif) => (notif._id === id ? { ...notif, status: 'seen' } : notif))
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, fetchNotifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
