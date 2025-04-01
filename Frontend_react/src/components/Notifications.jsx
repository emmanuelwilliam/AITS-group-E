import React from "react";
import "../styles/notifications.css";

const Notifications = () => {
  const notifications = [
    "Your issue has been resolved.",
    "New issue reported by Alex.",
    "Reminder: Submit feedback."
  ];
  
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;