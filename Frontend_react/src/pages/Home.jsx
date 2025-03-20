import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css"; // Ensure you have this CSS file for styling
import MakerereLogo from "../assets/Makerere Logo.png"; // Import the logo
import StudentIcon from "../assets/student.jpeg"; // Import student icon
import LecturerIcon from "../assets/lecturer.webp"; // Import lecturer icon
import ARIcon from "../assets/AR.webp"; // Import Academic Registrar icon
import MukIvoryt from "../assets/mukivoryt.webp"; // Import background images
import MukStudents from "../assets/mukstudents.png";
import MukLib from "../assets/muklib.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(MukIvoryt);
  const images = [MukIvoryt, MukStudents, MukLib];

  // Background slideshow logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage((prevImage) => {
        const currentIndex = images.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array prevents unnecessary re-renders

  // Handle login role selection
  const handleLoginClick = (role) => {
    navigate("/login", { state: { role } }); // Pass the selected role to the login page
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        transition: "background-image 1s ease-in-out", // Smooth transition effect
      }}
    >
      {/* Logo and Institution Name */}
      <div className="logo-container">
        <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
        <h1 className="institution-name">MAKERERE UNIVERSITY</h1>
      </div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/colleges">Colleges</a></li>
        </ul>
      </nav>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="What are you looking for?" aria-label="Search" />
      </div>

      {/* Login Options */}
      <div className="login-options">
        <h2>Login as:</h2>
        <div className="icons">
          <div className="icon" onClick={() => handleLoginClick("student")} role="button" tabIndex="0">
            <img src={StudentIcon} alt="Login as Student" />
            <button>Student</button>
          </div>
          <div className="icon" onClick={() => handleLoginClick("lecturer")} role="button" tabIndex="0">
            <img src={LecturerIcon} alt="Login as Lecturer" />
            <button>Lecturer</button>
          </div>
          <div className="icon" onClick={() => handleLoginClick("admin")} role="button" tabIndex="0">
            <img src={ARIcon} alt="Login as Academic Registrar" />
            <button>Academic Registrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
