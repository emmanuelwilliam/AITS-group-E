import React from "react";
import "../styles/adminTopBar.css";

const AdminTopBar = ({ firstName, lastName, email, role, institutionName, logo, onLogout }) => {
  return (
    <div className="admin-top-bar">
      <div className="institution-info">
        <img src={logo} alt="Institution Logo" className="logo" />
        <h1 className="institution-name">{institutionName}</h1>
      </div>
      <div className="user-info">
        <div className="user-details">
          <span className="user-name">{firstName} {lastName}</span>
          <span className="user-meta">{email} • {role}</span>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminTopBar;