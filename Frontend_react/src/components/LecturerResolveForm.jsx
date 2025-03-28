import React, { useState } from "react";
import "../styles/lecturerResolveForm.css";

const LecturerResolveForm = ({ issue, onResolve, onCancel }) => {
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolution.trim()) {
      setError("Resolution cannot be empty");
      return;
    }
    if (resolution.length < 20) {
      setError("Resolution must be at least 20 characters");
      return;
    }
    setError("");
    onResolve(resolution);
  };

  return (
    <div className="resolve-form-container">
      <h2>Resolve Issue: {issue.title}</h2>
      <div className="issue-details">
        <p><strong>Course:</strong> {issue.courseCode} - {issue.courseName}</p>
        <p><strong>Reported by:</strong> {issue.studentName}</p>
        <p><strong>Description:</strong> {issue.description}</p>
      </div>
      <form onSubmit={handleSubmit} className="resolve-form">
        <label htmlFor="resolution">Resolution Details:</label>
        <textarea
          id="resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Provide detailed resolution for this issue..."
          required
          minLength={20}
        />
        {error && <p className="error-message">{error}</p>}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit Resolution
          </button>
        </div>
      </form>
    </div>
  );
};

export default LecturerResolveForm;