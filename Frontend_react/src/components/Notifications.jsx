import React, { useEffect, useState } from "react";
import api from "../api/apiConfig";
import "../styles/notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('access_token');
    try {
      const { data } = await api.get("notifications/");
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        console.error('Unexpected response format:', data);
        setError('Received invalid data format');
      }
    } catch (err) {
      console.error('[Notifications] Error:', err.message);
      console.error('[Notifications] Response:', err.response?.data);
      if (err.response?.status === 401) {
        setError("Please login again to continue");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view notifications");
      } else {
        setError(err.response?.data?.error || "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="notifications">Loading notifications...</div>;
  if (error) return <div className="notifications error">{error}</div>;
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {error ? (
        <div className="notification-error">{error}</div>
      ) : (
        <ul className="notification-list">
          {notifications.length === 0 ? (
            <li className="no-notifications">No notifications</li>
          ) : (
            notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
              >
                <div className="notification-header">
                  <span className={`notification-type ${notification.notification_type}`}>
                    {notification.notification_type}
                  </span>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="notification-content">
                  {notification.issue_title && (
                    <div className="notification-issue">
                      Issue: {notification.issue_title}
                    </div>
                  )}
                  <div className="notification-message">{notification.message}</div>
                  {notification.issue_status && (
                    <div className="notification-status">
                      Status: {notification.issue_status}
                    </div>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Notifications;