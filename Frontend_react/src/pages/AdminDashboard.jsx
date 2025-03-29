import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopBar from "../components/AdminTopBar";
import DashboardOverview from "../components/DashboardOverview";
import ComplaintsReport from "../components/ComplaintsReport";
import StudentActivity from "../components/StudentActivity";
import CollegeStatistics from "../components/CollegeStatistics";
import AdminIssueResolveForm from "../components/AdminIssueResolveForm";
import "../styles/adminDashboard.css";
import logo from "../assets/Makerere Logo.png"; // Exact filename with space

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { firstName, lastName, email } = location.state || {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mak.ac.ug",
  };

  const handleLogout = () => {
    navigate("/login");
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
        <AdminSidebar />
        <main className="main-content">
          <Routes>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="complaints" element={<ComplaintsReport />} />
            <Route path="activity" element={<StudentActivity />} />
            <Route path="colleges" element={<CollegeStatistics />} />
            <Route path="resolve-issue" element={<AdminIssueResolveForm />} />
            <Route path="*" element={<DashboardOverview />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;