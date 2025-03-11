import React from "react";
import "../styles/notifications.css";

const Notifications = () => {
  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        <li>Your issue has been resolved.</li>
        <li>New issue reported by Alex.</li>
        <li>Reminder: Submit feedback.</li>
      </ul>
    </div>
  );
};

export default Notifications;