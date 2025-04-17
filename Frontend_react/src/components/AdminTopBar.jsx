import React from "react";
import "../styles/adminTopBar.css";

const AdminTopBar = ({
  firstName,
  lastName,
  email,
  role,
  institutionName,
  logo,
  onLogout
}) => {
  return (
    // Container for the top bar of the admin dashboard
    <div className="admin-top-bar">
      
      {/* Institution information section (left side) */}
      <div className="institution-info">
        {/* Institution logo image */}
        <img src={logo} alt="Institution Logo" className="logo" />
        
        {/* Display the name of the institution */}
        <h1 className="institution-name">{institutionName}</h1>
      </div>

      {/* User information section (right side) */}
      <div className="user-info">
        <div className="user-details">
          {/* Display user's full name */}
          <span className="user-name">{firstName} {lastName}</span>

          {/* Display user's email and role */}
          <span className="user-meta">{email} • {role}</span>
        </div>

        {/* Logout button */}
        <button onClick={onLogout} className="logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminTopBar;
