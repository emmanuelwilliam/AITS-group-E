import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import MakerereLogo from "../assets/Makerere Logo.png";
import StudentIcon from "../assets/student.jpeg";
import LecturerIcon from "../assets/lecturer.webp";
import ARIcon from "../assets/AR.webp";
import MukIvoryt from "../assets/mukivoryt.webp";
import MukStudents from "../assets/mukstudents.png";
import MukLib from "../assets/muklib.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState(MukIvoryt);
  const images = [MukIvoryt, MukStudents, MukLib];

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundImage((prevImage) => {
        const currentIndex = images.indexOf(prevImage);
        const nextIndex = (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLoginClick = (role) => {
    navigate("/login", { state: { role } });
  };

  return (
    <div
      className="home-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="header">
        <div className="logo-container">
          <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
          <h1 className="institution-name">MAKERERE UNIVERSITY</h1>
        </div>

        <nav className="navbar">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/colleges">Colleges</a></li>
          </ul>
        </nav>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="What are you looking for?" aria-label="Search" />
      </div>

      <div className="login-options">
        <h2>Login as:</h2>
        <div className="icons">
          <div className="icon" onClick={() => handleLoginClick("student")}>
            <img src={StudentIcon} alt="Login as Student" />
            <button>Student</button>
          </div>
          <div className="icon" onClick={() => handleLoginClick("lecturer")}>
            <img src={LecturerIcon} alt="Login as Lecturer" />
            <button>Lecturer</button>
          </div>
          <div className="icon" onClick={() => handleLoginClick("admin")}>
            <img src={ARIcon} alt="Login as Academic Registrar" />
            <button>Academic Registrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;