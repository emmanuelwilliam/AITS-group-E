import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import LecturerSidebar from "../components/LecturerSidebar";
import LecturerTopBar from "../components/LecturerTopBar";
import LecturerNotifications from "../components/LecturerNotifications";
import LecturerIssueList from "../components/LecturerIssueList"; // Changed from IssueList
import LecturerResolvedIssues from "../components/LecturerResolvedIssues"; // Changed from ResolvedIssues
import LecturerResolveForm from "../components/LecturerResolveForm";
import "../styles/lecturerDashboard.css";

const LecturerDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const location = useLocation();
  const { firstName, lastName, email, role } = location.state || {
    firstName: "Lecturer",
    lastName: "User",
    email: "lecturer@mak.ac.ug",
    role: "Lecturer",
  };

  const handleResolveIssue = (resolution) => {
    // Implement your resolution logic here
    console.log("Resolving issue:", selectedIssue.id, "with:", resolution);
    setSelectedIssue(null);
    setActiveComponent("resolvedIssues");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "notifications":
        return <LecturerNotifications />;
      case "issueList":
        return <LecturerIssueList onSelectIssue={setSelectedIssue} />;
      case "resolveIssues":
        return selectedIssue ? (
          <LecturerResolveForm 
            issue={selectedIssue} 
            onResolve={handleResolveIssue} 
          />
        ) : (
          <div className="select-issue-prompt">
            <p>Please select an issue from the Issue List first</p>
            <button onClick={() => setActiveComponent("issueList")}>
              Go to Issue List
            </button>
          </div>
        );
      case "resolvedIssues":
        return <LecturerResolvedIssues />;
      default:
        return <LecturerNotifications />;
    }
  };

  return (
    <div className="lecturer-dashboard">
      <LecturerTopBar
        firstName={firstName}
        lastName={lastName}
        email={email}
        role={role}
      />
      <div className="dashboard-content">
        <LecturerSidebar setActiveComponent={setActiveComponent} />
        <div className="main-content">
          <div className="content">{renderComponent()}</div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;