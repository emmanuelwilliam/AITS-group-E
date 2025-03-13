import React, { useState } from "react";
import { Link } from "react-router-dom"
import "../styles/verification.css";

const Verification = () => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Code Submitted: ${code}`);
  };

  return (
    <div className="verification-container">
      <h2>Verify Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter 4-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Verify</button>
      </form>
      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );
};

export default Verification;