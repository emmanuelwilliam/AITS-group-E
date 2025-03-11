import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import MakerereLogo from "../assets/Makerere Logo.png";

const Login = () => {
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentNumber && password) {
      // Simulate fetching student name based on student number
      const studentName = "Alex Chen"; // Replace with actual data
      navigate("/dashboard", { state: { studentName, studentNumber } }); // Pass credentials to Dashboard
    } else {
      alert("Please enter valid credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={MakerereLogo} alt="Makerere Logo" className="logo" />
        <h2>Welcome to the MAK Academic Issue Tracking System</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Student Number"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="remember-forgot">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          <button type="submit">Log In</button>
        </form>
        <p className="register-link">
          New member here? <a href="/register">Register Now</a>
        </p>
      </div>
    </div>
  );
};

export default Login;