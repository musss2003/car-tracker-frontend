import React from 'react';
import "./Notifications.css";

const Notifications = ({ alerts }) => {
    return (
        <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Alerts & Notifications</h2>
            {alerts.map((alert) => (
                <div key={alert.id} className="bg-gray-100 p-3 rounded mb-2">
                    <p className="text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default Notifications;
