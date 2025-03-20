import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faList, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "../styles/lecturerSidebar.css";

const LecturerSidebar = ({ setActiveComponent }) => {
  return (
    <div className="lecturer-sidebar">
      <div className="sidebar-logo">AITS</div>
      <ul className="sidebar-menu">
        <li onClick={() => setActiveComponent("notifications")}>
          <FontAwesomeIcon icon={faBell} className="sidebar-icon" />
          Notifications
        </li>
        <li onClick={() => setActiveComponent("issueList")}>
          <FontAwesomeIcon icon={faList} className="sidebar-icon" />
          Issue List
        </li>
        <li onClick={() => setActiveComponent("resolvedIssues")}>
          <FontAwesomeIcon icon={faCheckCircle} className="sidebar-icon" />
          Resolved Issues
        </li>
      </ul>
    </div>
  );
};

export default LecturerSidebar;