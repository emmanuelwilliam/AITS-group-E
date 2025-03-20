import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import MakerereLogo from "../assets/Makerere Logo.png"; // Import the logo
import "../styles/lecturerTopBar.css";

const LecturerTopBar = () => {
  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logged out");
  };

  return (
    <div className="lecturer-top-bar">
      <div className="logo-section">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" />
        <h1>MAKERERE UNIVERSITY</h1>
      </div>
      <div className="search-section">
        <input type="text" placeholder="Search..." />
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
      </div>
      <div className="profile-section">
        <FontAwesomeIcon icon={faUser} className="profile-icon" />
        <span>Lecturer Name</span>
        <button onClick={handleLogout} className="logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
    </div>
  );
};

export default LecturerTopBar;