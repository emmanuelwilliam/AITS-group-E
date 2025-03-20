import React, { useState } from "react";
import LecturerTopBar from "../components/LecturerTopBar";
import LecturerSidebar from "../components/LecturerSidebar";
import LecturerNotifications from "../components/LecturerNotifications";
import LecturerIssueList from "../components/LecturerIssueList";
import LecturerResolvedIssues from "../components/LecturerResolvedIssues";
import "../styles/lecturerDashboard.css";

const LecturerDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications"); // State to manage active component

  return (
    <div className="lecturer-dashboard">
      <LecturerTopBar />
      <div className="dashboard-content">
        <LecturerSidebar setActiveComponent={setActiveComponent} />
        <div className="main-content">
          {activeComponent === "notifications" && <LecturerNotifications />}
          {activeComponent === "issueList" && <LecturerIssueList />}
          {activeComponent === "resolvedIssues" && <LecturerResolvedIssues />}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;