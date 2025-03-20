import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import MakerereLogo from "../assets/Makerere Logo.png"; // Import the logo
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import required icons

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && password) {
      // Simulate login logic
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Redirect to dashboard with user data
          navigate("/dashboard", { state: data });
        } else {
          alert(data.message || "Invalid email or password.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please enter valid credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" /> {/* Add the logo */}
        <h2>Welcome to the MAK Academic Issue Tracking System</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" /> {/* Email icon */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-container">
            <FontAwesomeIcon icon={faLock} className="input-icon" /> {/* Password icon */}
            <input
              type={showPassword ? "text" : "password"} // Toggle password visibility
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye} // Toggle password visibility icon
              className="password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
            />
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <button type="submit">Log In</button>
        </form>
        <p className="register-link">
          New member here?{" "}
          <button onClick={() => navigate("/register")}>Create Account</button>
        </p>
      </div>
    </div>
  );
};

export default Login;