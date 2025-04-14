import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/verification.css";

const Verification = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect if no email in state
  useEffect(() => {
    if (!location.state?.email) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const email = location.state?.email;
  
  if (!email) return null; // Prevent rendering while redirecting

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