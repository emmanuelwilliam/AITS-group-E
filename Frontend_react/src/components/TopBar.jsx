import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MakerereLogo from "../assets/Makerere Logo.png"; // Import the logo
import "../styles/topBar.css";

const TopBar = ({ firstName, lastName, studentNumber, registrationNumber, webmail, college, course }) => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    // Redirect to the login screen
    navigate("/login");
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" /> {/* Add logo */}
        <h1>MAK Academic Issue Tracking System</h1>
        <div className="profile-section">
          <button className="profile-button" onClick={toggleProfile}>
            Profile
            <span className="badge">3</span> {/* Example badge for notifications */}
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <h2>Profile Information</h2>
              <p><strong>First Name:</strong> {firstName}</p>
              <p><strong>Last Name:</strong> {lastName}</p>
              <p><strong>Student Number:</strong> {studentNumber}</p>
              <p><strong>Registration Number:</strong> {registrationNumber}</p>
              <p><strong>Webmail:</strong> {webmail}</p>
              <p><strong>College:</strong> {college}</p>
              <p><strong>Course:</strong> {course}</p>
            </div>
          )}
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;