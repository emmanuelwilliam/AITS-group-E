import React from "react";
import "../styles/lecturerNotifications.css"; // Import custom styles for notifications

const LecturerNotifications = () => {
  // Sample notifications data (can later be replaced with dynamic API data)
  const notifications = [
    { id: 1, message: "New issue submitted by Alex Chen" },
    { id: 2, message: "Issue #2 resolved by Emma William" },
  ];

  return (
    // Container for notifications list
    <div className="notifications">
      <h2>Notifications</h2> {/* Section heading */}

      <ul>
        {/* Render each notification as a list item */}
        {notifications.map((notification) => (
          <li key={notification.id}>{notification.message}</li> // Unique key ensures stable rendering
        ))}
      </ul>
    </div>
  );
};

export default LecturerNotifications;
