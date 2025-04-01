import React, { useState } from "react";
import "../styles/lecturerResolveForm.css";

const LecturerResolveForm = ({ issue, onResolve, onRequestInfo, onAssign, onClose }) => {
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState(issue.status || "Open");
  const [attachments, setAttachments] = useState([]);
  const [newAttachment, setNewAttachment] = useState(null);

  const handleSubmit = (action) => {
    if (action === "resolve" && resolution.trim().length < 20) {
      alert("Resolution must be at least 20 characters");
      return;
    }
    
    const resolutionData = {
      status,
      resolution,
      attachments,
      action
    };
    
    switch(action) {
      case "request-info":
        onRequestInfo(resolutionData);
        break;
      case "resolve":
        onResolve(resolutionData);
        break;
      case "close":
        onClose(resolutionData);
        break;
      case "assign":
        onAssign(resolutionData);
        break;
    }
  };

  const handleAttachmentChange = (e) => {
    setNewAttachment(e.target.files[0]);
  };

  const addAttachment = () => {
    if (newAttachment) {
      setAttachments([...attachments, newAttachment]);
      setNewAttachment(null);
    }
  };

  return (
    <div className="resolve-form-container">
      {/* Issue Header Section */}
      <div className="issue-header">
        <h2>Issue Resolution Form</h2>
        <div className="issue-meta">
          <div className="meta-row">
            <span className="meta-label">Issue Title:</span>
            <span className="meta-value">{issue.title}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Issue ID:</span>
            <span className="meta-value">#{issue.id}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Student:</span>
            <span className="meta-value">{issue.studentName} ({issue.studentId})</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Reported:</span>
            <span className="meta-value">{new Date(issue.reportedDate).toLocaleString()}</span>
          </div>
        </div>

        <div className="issue-academic-info">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">College:</span>
              <span className="info-value">{issue.college}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Program:</span>
              <span className="info-value">{issue.program}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Year of Study:</span>
              <span className="info-value">{issue.yearOfStudy}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Semester:</span>
              <span className="info-value">{issue.semester}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Course Unit:</span>
              <span className="info-value">{issue.courseUnit}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Course Code:</span>
              <span className="info-value">{issue.courseCode}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status-badge">{issue.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Description Section */}
      <div className="section">
        <h3>Issue Description</h3>
        <div className="description-box">
          <p>{issue.description}</p>
        </div>
      </div>

      {/* Attachments Section */}
      {issue.attachments && issue.attachments.length > 0 && (
        <div className="section">
          <h3>Attachments</h3>
          <div className="attachments-list">
            {issue.attachments.map((file, index) => (
              <a key={index} href={file.url} className="attachment-item" target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments/History Section */}
      {issue.comments && issue.comments.length > 0 && (
        <div className="section">
          <h3>Comments/History</h3>
          <div className="comments-list">
            {issue.comments.map((comment, index) => (
              <div key={index} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-date">
                    {new Date(comment.date).toLocaleString()}
                  </span>
                </div>
                <div className="comment-content">{comment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Form Section */}
      <div className="section">
        <h3>Resolution Details</h3>
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="status-select"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="resolution">Resolution/Response:</label>
          <textarea
            id="resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Enter detailed resolution..."
            rows={8}
            required
          />
        </div>

        <div className="form-group">
          <label>Attachments:</label>
          <div className="attachment-controls">
            <input
              type="file"
              onChange={handleAttachmentChange}
              className="file-input"
            />
            <button
              type="button"
              onClick={addAttachment}
              className="add-attachment-btn"
            >
              Add Attachment
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="new-attachments-list">
              {attachments.map((file, index) => (
                <span key={index} className="attachment-badge">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          type="button"
          onClick={() => handleSubmit("request-info")}
          className="btn request-info-btn"
        >
          Request More Information
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("assign")}
          className="btn assign-btn"
        >
          Assign to Another Lecturer
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("resolve")}
          className="btn resolve-btn"
        >
          Mark as Resolved
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("close")}
          className="btn close-btn"
        >
          Close Issue
        </button>
      </div>
    </div>
  );
};

export default LecturerResolveForm;