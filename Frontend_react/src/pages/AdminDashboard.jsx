import React, { useState } from "react"; // Import React and useState hook
import { Outlet, useLocation, useNavigate } from "react-router-dom"; // Import routing hooks from react-router-dom
import AdminSidebar from "../components/AdminSidebar"; // Import the AdminSidebar component
import AdminTopBar from "../components/AdminTopBar"; // Import the AdminTopBar component
import "../styles/adminDashboard.css"; // Import the CSS file for dashboard styling
import logo from "../assets/Makerere Logo.png"; // Import the Makerere University logo image

// Functional component for AdminDashboard
const AdminDashboard = () => {
  const location = useLocation(); // Hook to access the current route's location object
  const navigate = useNavigate(); // Hook to programmatically navigate to different routes
  
  // Destructure user data from location.state, provide default values if undefined
  const { firstName, lastName, email } = location.state || {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mak.ac.ug",
  };

  // Function to handle logout, redirects user to the login page
  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="admin-dashboard"> {/* Container for the entire admin dashboard */}
      <AdminTopBar 
        firstName={firstName}
        lastName={lastName}
        email={email}
        role="Administrator"
        institutionName="Makerere University"
        logo={logo}
        onLogout={handleLogout}
      />
      <div className="dashboard-container"> {/* Main dashboard layout */}
        <AdminSidebar /> {/* Sidebar navigation component */}
        <main className="main-content"> {/* Area for rendering nested routes */}
          <Outlet /> {/* Placeholder for nested route content */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; // Export the AdminDashboard component
