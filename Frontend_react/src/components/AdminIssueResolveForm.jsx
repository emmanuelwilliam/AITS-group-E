import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/adminForms.css";

const AdminIssueResolveForm = () => {
  const [formData, setFormData] = useState({
    studentId: "",
    issueType: "transcript",
    description: "",
    resolution: "",
    status: "pending",
    priority: "medium"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call would go here
    console.log("Issue resolution submitted:", formData);
    alert("Issue resolution recorded successfully!");
    navigate("/admin/dashboard");
  };

  return (
    <div className="admin-form-container">
      <h2>Academic Issue Resolution</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student ID</label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Issue Type</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
            >
              <option value="transcript">Academic Transcript</option>
              <option value="registration">Registration Issue</option>
              <option value="graduation">Graduation Problem</option>
              <option value="certificate">Certificate Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Issue Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Resolution Details</label>
          <textarea
            name="resolution"
            value={formData.resolution}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Submit Resolution
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminIssueResolveForm;