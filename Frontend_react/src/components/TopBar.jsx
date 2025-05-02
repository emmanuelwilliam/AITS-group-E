import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MakerereLogo from "../assets/Makerere Logo.png";
import { FiSearch } from "react-icons/fi"; // Import search icon
import "../styles/topBar.css";

const TopBar = ({ firstName, lastName, studentNumber, registrationNumber, webmail, college, course }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("adminToken"); // Clear admin token from session storage
      navigate("/"); // Redirect to the home page
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" />
        <h1>MAK Academic Issue Tracking System</h1>
        
        {/* Search Box */}
        <div className="search-box">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <FiSearch className="search-icon" />
            </button>
          </form>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <button className="profile-button" onClick={toggleProfile}>
            Profile
          </button>
          {showProfile && (
            <div className="profile-dropdown">
              <h2>Profile Information</h2>
              <p><strong>First Name:</strong> {firstName || "N/A"}</p>
              <p><strong>Last Name:</strong> {lastName || "N/A"}</p>
              <p><strong>Student Number:</strong> {studentNumber || "N/A"}</p>
              <p><strong>Registration Number:</strong> {registrationNumber || "N/A"}</p>
              <p><strong>Webmail:</strong> {webmail || "N/A"}</p>
              <p><strong>College:</strong> {college || "N/A"}</p>
              <p><strong>Course:</strong> {course || "N/A"}</p>
            </div>
          )}
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;