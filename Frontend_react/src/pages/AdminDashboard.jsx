import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import Notifications from "../components/Notifications";
import UserManagement from "../components/UserManagement";
import SystemSettings from "../components/SystemSettings";
import Reports from "../components/Reports";
import "../styles/dashboard.css";

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("notifications");
  const location = useLocation();
  const { firstName, lastName, email, role } = location.state || {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mak.ac.ug",
    role: "Administrator",
  }; // Fallback for testing

  const renderComponent = () => {
    switch (activeComponent) {
      case "notifications":
        return <Notifications />;
      case "userManagement":
        return <UserManagement />;
      case "systemSettings":
        return <SystemSettings />;
      case "reports":
        return <Reports />;
      default:
        return <Notifications />;
    }
  };

  return (
    <div className="dashboard">
      <TopBar
        firstName={firstName}
        lastName={lastName}
        email={email}
        role={role}
      />
      <Sidebar setActiveComponent={setActiveComponent} role="admin" />
      <div className="main-content">
        <div className="content">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;