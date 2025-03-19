import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Notifications from "../components/Notifications";
import IssueReporting from "../components/IssueReporting";
import IssueTracking from "../components/IssueTracking";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications");
  const location = useLocation();
  const { firstName, lastName, studentNumber, registrationNumber, webmail, college, course } = location.state || {
    firstName: "Alex",
    lastName: "Chen",
    studentNumber: "2400711336",
    registrationNumber: "123456",
    webmail: "alex.chen@students.mak.ac.ug",
    college: "College of Computing",
    course: "Computer Science",
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
      <TopBar
        firstName={firstName}
        lastName={lastName}
        studentNumber={studentNumber}
        registrationNumber={registrationNumber}
        webmail={webmail}
        college={college}
        course={course}
      />
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="main-content">
        <div className="content">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;