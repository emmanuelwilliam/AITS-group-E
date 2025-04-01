import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopBar from "../components/AdminTopBar";
import "../styles/adminDashboard.css";
import logo from "../assets/Makerere Logo.png";

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;