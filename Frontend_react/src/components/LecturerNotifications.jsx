import React, { useEffect, useState } from "react";
import api from "../api/apiConfig";
import "../styles/lecturerNotifications.css"; // Import custom styles for notifications

const LecturerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("notifications/");
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications");
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
      <ul>
        {notifications.length === 0 && <li>No notifications</li>}
        {notifications.map((notification) => (
          <li key={notification.id || notification._id}>{notification.message || notification.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default LecturerNotifications;
