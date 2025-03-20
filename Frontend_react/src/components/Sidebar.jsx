import React from "react";
import "../styles/sidebar.css";
import IssueReportingIcon from "../assets/IR.jpg"; // Import Issue Reporting icon
import IssueTrackingIcon from "../assets/IT.png"; // Import Issue Tracking icon
import NotificationsIcon from "../assets/NOT.png"; // Import Notifications icon

const Sidebar = ({ setActiveComponent }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">AITS</div>
      <ul className="sidebar-menu">
        <li onClick={() => setActiveComponent("notifications")}>
          <img src={NotificationsIcon} alt="Notifications" className="sidebar-icon" />
          Notifications
        </li>
        <li onClick={() => setActiveComponent("issueReporting")}>
          <img src={IssueReportingIcon} alt="Issue Reporting" className="sidebar-icon" />
          Issue Reporting
        </li>
        <li onClick={() => setActiveComponent("issueTracking")}>
          <img src={IssueTrackingIcon} alt="Issue Tracking" className="sidebar-icon" />
          Issue Tracking
        </li>
        <li>About</li>
        <li>Contact</li>
      </ul>
    </div>
  );
};

export default Sidebar;