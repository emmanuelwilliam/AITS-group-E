import React from "react";
import "../styles/lecturerSidebar.css";

const LecturerSidebar = () => {
  return (
    <div className="lecturer-sidebar">
      <div className="sidebar-logo">AITS</div>
      <ul className="sidebar-menu">
        <li>Notifications</li>
        <li>Issue List</li>
        <li>Resolve Issues</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </div>
  );
};

export default LecturerSidebar;