import React, { useState } from "react"; // Import React and useState hook
import { useLocation } from "react-router-dom"; // Import hook to access route location state
import LecturerSidebar from "../components/LecturerSidebar"; // Sidebar component for navigation
import LecturerTopBar from "../components/LecturerTopBar"; // Top bar with lecturer info
import LecturerNotifications from "../components/LecturerNotifications"; // Notifications component
import LecturerIssueList from "../components/LecturerIssueList"; // List of student-reported issues
import LecturerResolvedIssues from "../components/LecturerResolvedIssues"; // Component showing resolved issues
import LecturerResolveForm from "../components/LecturerResolveForm"; // Form for resolving selected issue
import "../styles/lecturerDashboard.css"; // Styling for the dashboard layout

// Functional component for Lecturer Dashboard
const LecturerDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications"); // Controls which view is visible
  const [selectedIssue, setSelectedIssue] = useState(null); // Tracks the currently selected issue for resolution

  const location = useLocation(); // Get state passed through navigation (e.g., user info)
  const { firstName, lastName, email, role } = location.state || {
    firstName: "Lecturer",
    lastName: "User",
    email: "lecturer@mak.ac.ug",
    role: "Lecturer",
  };

  // Callback when an issue is resolved
  const handleResolveIssue = (resolution) => {
    // You can add resolution logic or API calls here
    console.log("Resolving issue:", selectedIssue.id, "with:", resolution);
    setSelectedIssue(null); // Clear selected issue
    setActiveComponent("resolvedIssues"); // Navigate to resolved issues view
  };

  // Render the component corresponding to the active selection
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
          // If no issue is selected, prompt user to go to issue list
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
        return <LecturerNotifications />; // Default fallback
    }
  };

  return (
    <div className="lecturer-dashboard">
      {/* Top bar displaying user information */}
      <LecturerTopBar
        firstName={firstName}
        lastName={lastName}
        email={email}
        role={role}
      />
      
      {/* Dashboard layout with sidebar and main content area */}
      <div className="dashboard-content">
        <LecturerSidebar setActiveComponent={setActiveComponent} /> {/* Sidebar navigation */}
        <div className="main-content">
          <div className="content">
            {renderComponent()} {/* Dynamically render the active section */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard; // Export the LecturerDashboard component for use in app
