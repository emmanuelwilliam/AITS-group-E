import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopBar from "../components/AdminTopBar";
import DashboardOverview from "../components/DashboardOverview";
import ComplaintsReport from "../components/ComplaintsReport";
import StudentActivity from "../components/StudentActivity";
import CollegeStatistics from "../components/CollegeStatistics";
import AdminIssueResolveForm from "../components/AdminIssueResolveForm";
import "../styles/adminDashboard.css";
import logo from "../assets/logo.png";

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  
  const { firstName, lastName, email } = location.state || {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mak.ac.ug",
  };

  const handleLogout = () => {
    // Clear any admin session data if needed
    navigate("/login");
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "dashboard": return <DashboardOverview />;
      case "complaints": return <ComplaintsReport />;
      case "activity": return <StudentActivity />;
      case "colleges": return <CollegeStatistics />;
      case "resolve-issue": return <AdminIssueResolveForm />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminTopBar 
        firstName={firstName}
        lastName={lastName}
        email={email}
        role="Administrator"
        institutionName="Makerere University"
        logo={logo}
        onLogout={handleLogout}
      />
      <div className="dashboard-container">
        <AdminSidebar 
          setActiveComponent={setActiveComponent}
          activeComponent={activeComponent}
        />
        <main className="main-content">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;