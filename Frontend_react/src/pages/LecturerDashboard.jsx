import React, { useState } from "react";
import LecturerSidebar from "../components/LecturerSidebar";
import LecturerIssueList from "../components/LecturerIssueList";
import LecturerResolveForm from "../components/LecturerResolveForm";
import "../styles/lecturerDashboard.css";

const LecturerDashboard = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Example data for assigned issues
  const issues = [
    {
      id: 1,
      title: "Network Connectivity Issue",
      description: "Unable to connect to the university Wi-Fi.",
      studentName: "Alex Chen",
      status: "Pending",
    },
    {
      id: 2,
      title: "Assignment Submission Problem",
      description: "Cannot upload assignment to the portal.",
      studentName: "Emma William",
      status: "In Progress",
    },
  ];

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
  };

  const handleResolveIssue = (resolution) => {
    console.log("Resolved Issue:", selectedIssue, "Resolution:", resolution);
    // Update issue status in the backend
    setSelectedIssue(null); // Clear selected issue after resolution
  };

  return (
    <div className="lecturer-dashboard">
      <LecturerSidebar />
      <div className="main-content">
        <h1>Lecturer Dashboard</h1>
        <div className="dashboard-content">
          <LecturerIssueList issues={issues} onIssueSelect={handleIssueSelect} />
          {selectedIssue && (
            <LecturerResolveForm
              issue={selectedIssue}
              onResolve={handleResolveIssue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;