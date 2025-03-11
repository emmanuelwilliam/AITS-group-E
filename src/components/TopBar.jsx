import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/topbar.css";
import MakerereLogo from "../assets/Makerere Logo.png";

const TopBar = ({ studentName, studentNumber }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    navigate("/"); // Redirect to the Login Screen
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" />
        <h1>Makerere University</h1>
      </div>
      <div className="topbar-right">
        <div className="student-profile">
          <span>{studentName}</span>
          <span>Student No.: {studentNumber}</span>
          <div className="dropdown" onClick={toggleDropdown}>
            <img
              src="https://via.placeholder.com/40" // Replace with actual student profile image
              alt="Student Profile"
              className="profile-pic"
            />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">Help</div>
                <div className="dropdown-item">Profile</div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;