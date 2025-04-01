import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/verification.css";

const Verification = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const email = location.state?.email || "your email"; // Get email from navigation state

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your verification logic here
    alert(`Verification code ${code} submitted for ${email}`);
  };

  return (
    <div className="verification-container">
      <h2>Verify Your Account</h2>
      <p>We've sent a verification code to {email}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter 4-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={4}
        />
        <button type="submit">Verify</button>
      </form>
      
      <p className="back-link">
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );
};

export default Verification;