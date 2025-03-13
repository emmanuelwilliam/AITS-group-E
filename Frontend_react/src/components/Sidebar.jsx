import React from "react";
import "../styles/sidebar.css";

const Sidebar = ({ setActiveComponent }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">AITS</div>
      <ul className="sidebar-menu">
        <li onClick={() => setActiveComponent("notifications")}>Notifications</li>
        <li onClick={() => setActiveComponent("issueReporting")}>Issue Reporting</li>
        <li onClick={() => setActiveComponent("issueTracking")}>Issue Tracking</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </div>
  );
};

export default Sidebar;