import React, { useState } from "react";
import "../styles/lecturerDashboard.css";

const LecturerResolveForm = ({ issue, onResolve }) => {
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState(issue.status);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolution || !status) {
      alert("Please fill in all fields.");
      return;
    }
    onResolve({ resolution, status });
  };

  return (
    <div className="resolve-form">
      <h2>Resolve Issue: {issue.title}</h2>
      <p><strong>Student:</strong> {issue.studentName}</p>
      <p><strong>Description:</strong> {issue.description}</p>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Resolution Details"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <button type="submit">Submit Resolution</button>
      </form>
    </div>
  );
};

export default LecturerResolveForm;