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
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

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
    <div className="home-wrapper">
      <div
        className="home-container"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="header">
          <div className="logo-container">
            <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
            <h1 className="institution-name">MAKERERE UNIVERSITY</h1>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="What are you looking for?" aria-label="Search" />
          </div>
        </div>

        <div className="main-content">
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
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>AITS (Academic Issue Tracking Sysytem)</h3>
            <p>
              AITS is run by CS24 GROUP E, under COCIS (College of Computing and Information Science), Makerere University. 
              This platform has been set up and updated by the group e BCSC 24. 
              For more information contact us via groupe@gmail.com.
            </p>
          </div>

          <div className="footer-links">
            <div className="quick-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="https://www.mak.ac.ug" target="_blank" rel="noopener noreferrer">Makerere Main Site</a></li>
                <li><a href="https://intranet.mak.ac.ug" target="_blank" rel="noopener noreferrer">Intranet</a></li>
                <li><a href="/modules">Module community</a></li>
              </ul>
            </div>

            <div className="contact-info">
              <h4>Contact Us</h4>
              <ul>
                <li>Phone: (+256) 753863729 (AITS)</li>
                <li>E-mail: groupe24@gmail.com</li>
              </ul>
            </div>

            <div className="social-media">
              <h4>Follow Us</h4>
              <div className="social-icons">
                <a href="https://www.facebook.com/Makerere" target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="icon" />
                </a>
                <a href="https://x.com/Makerere" target="_blank" rel="noopener noreferrer">
                  <FaTwitter className="icon" />
                </a>
                <a href="https://www.instagram.com/makerere/#" target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="icon" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="copyright">
          <p>Copyright © {new Date().getFullYear()} - Makerere University | AITS (Academic Issue Tracking Sysytem)</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;