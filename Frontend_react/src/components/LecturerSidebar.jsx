import React from "react";
import "../styles/lecturerDashboard.css";

const LecturerSidebar = () => {
  return (
    <div className="lecturer-sidebar">
      <h2>Lecturer Menu</h2>
      <ul>
        <li>Assigned Issues</li>
        <li>Resolved Issues</li>
        <li>Profile</li>
        <li>Logout</li>
      </ul>
    </div>
  );
};

export default LecturerSidebar;