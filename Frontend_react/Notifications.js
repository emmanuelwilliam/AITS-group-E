// src/components/Notifications.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications from the backend API
    axios.get('http://localhost:8000/api/notifications/')
      .then((res) => {
        setNotifications(res.data); // Set notifications data
      })
      .catch((err) => {
        console.error("Error fetching notifications:", err);
      });
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li
              key={notification.id}
              style={{
                fontWeight: notification.is_read ? 'normal' : 'bold',  // Bold unread notifications
                borderLeft: `5px solid ${getColor(notification.notification_type)}`, // Color based on type
                paddingLeft: '10px',
                marginBottom: '10px'
              }}
            >
              <strong>[{notification.notification_type.toUpperCase()}]</strong> {notification.message}
              <br />
              <small>{new Date(notification.created_at).toLocaleString()}</small> {/* Timestamp */}
            </li>
          ))
        ) : (
          <p>No notifications yet.</p> // Display this if there are no notifications
        )}
      </ul>
    </div>
  );
};

// Helper function to get color based on notification type
const getColor = (type) => {
  switch (type) {
    case 'info': return 'blue';
    case 'warning': return 'orange';
    case 'error': return 'red';
    default: return 'gray'; // Default color
  }
};

export default Notifications;
