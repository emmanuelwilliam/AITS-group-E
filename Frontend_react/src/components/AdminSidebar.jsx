import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "dashboard" },
    { id: "complaints", label: "Complaints", path: "complaints" },
    { id: "activity", label: "Student Activity", path: "activity" },
    { id: "colleges", label: "College Statistics", path: "colleges" },
    { id: "resolve-issue", label: "Resolve Issues", path: "resolve-issue" }
  ];

  return (
    <div className="admin-sidebar">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.id}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;