import React from "react";
import "../styles/lecturerNotifications.css";

const LecturerNotifications = () => {
  const notifications = [
    { id: 1, message: "New issue submitted by Alex Chen" },
    { id: 2, message: "Issue #2 resolved by Emma William" },
  ];

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default LecturerNotifications;