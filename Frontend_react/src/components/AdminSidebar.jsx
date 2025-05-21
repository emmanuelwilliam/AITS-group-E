import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate to different routes

  // Sidebar menu items with labels and paths
  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin-dashboard/dashboard" },
    { id: "complaints", label: "Complaints", path: "/admin-dashboard/complaints" },
    { id: "activity", label: "Student Activity", path: "/admin-dashboard/activity" },
    { id: "colleges", label: "College Statistics", path: "/admin-dashboard/colleges" },
    { id: "resolve-issue", label: "Resolve Issues", path: "/admin-dashboard/resolve-issue" }
  ];

  return (
    <div className="admin-sidebar"> {/* Sidebar container with custom styling */}
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.id} // Unique key for each list item
            onClick={() => navigate(item.path)} // Navigate to the route on click
          >
            {item.label} {/* Display label of the menu item */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
