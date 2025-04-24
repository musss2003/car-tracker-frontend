import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/notifications/';



export const getNotifications = async () => {
    try {
        const notifications = await fetch(API_URL, {
            method: "GET",
            headers: getAuthHeaders(),
        }).then((response) => response.json())
        .then((data) => {
            return data;
        })

        return notifications;
    } catch (err) {
        console.error(err.message || "Something went wrong");
    }
}

export const markAsSeen = async (notificationId) => {
    try {
        const response = await fetch(`${API_URL}${notificationId}/seen`, {
            method: "PATCH",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to mark notification as seen");
        }

        // Update the notification status locally
        return response.json();
    } catch (err) {
        console.error(err.message);
    }
}

export const markAllAsSeen = async () => {
    try {
        const response = await fetch(API_URL + "mark-all-seen", {
            method: "PATCH",
        });

        if (!response.ok) {
            throw new Error("Failed to mark all notifications as seen");
        }

        return response.json();
    } catch (err) {
        console.error(err.message);
    }
};

export const getUnreadNotifications = async () => {
    try {
        const unreadNotifications = await fetch(API_URL + 'unread', {
            method: "GET",
            headers: getAuthHeaders(),
        }).then((response) => response.json())
        .then((data) => {
            return data.notifications;
        });


        return unreadNotifications;
    } catch (err) {
        console.error(err.message || "Something went wrong");
    }
};
export const deleteNotification = async (notificationId) => {
    try {
        const response = await fetch(`${API_URL}${notificationId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to delete notification");
        }

        return response.json();
    } catch (err) {
        console.error(err.message);
    }
};
