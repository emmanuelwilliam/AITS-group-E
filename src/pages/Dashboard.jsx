import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Notifications from "../components/Notifications";
import IssueReporting from "../components/IssueReporting";
import IssueTracking from "../components/IssueTracking";
import "../styles/index.css";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications");
  const location = useLocation();
  const { studentName, studentNumber } = location.state || {
    studentName: "Alex Chen",
    studentNumber: "2400711336",
  }; // Fallback for testing

  const renderComponent = () => {
    switch (activeComponent) {
      case "notifications":
        return <Notifications />;
      case "issueReporting":
        return <IssueReporting />;
      case "issueTracking":
        return <IssueTracking />;
      default:
        return <Notifications />;
    }
  };

  return (
    <div className="dashboard">
      <TopBar studentName={studentName} studentNumber={studentNumber} />
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="main-content">
        <div className="content">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;