import React from "react";
import "../styles/adminSidebar.css";

const AdminSidebar = ({ setActiveComponent, activeComponent }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "complaints", label: "Complaints" },
    { id: "activity", label: "Student Activity" },
    { id: "colleges", label: "College Statistics" },
    { id: "resolve-issue", label: "Resolve Issues" }
  ];

  return (
    <div className="admin-sidebar">
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={activeComponent === item.id ? "active" : ""}
            onClick={() => setActiveComponent(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;