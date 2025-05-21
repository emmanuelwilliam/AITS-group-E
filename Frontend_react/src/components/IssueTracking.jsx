import React, { useEffect, useState } from "react";
import "../styles/issueTracking.css";
import { fetchStudentIssues } from "../api/issueService";

const IssueTracking = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchStudentIssues().then(setIssues).catch(() => setIssues([]));
  }, []);

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    if (!status) return 'gray';
    
    switch (status.toLowerCase()) {
      case 'open':
        return 'blue';
      case 'assigned':
        return 'orange';
      case 'in progress':
        return 'yellow';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      case 'pending information':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <div className="issue-tracking">
      <h2>Issue Tracking</h2>
      <div className="issues-list">
        {issues.map((issue) => (
          <div key={issue.id} className={`issue-card ${getStatusColor(issue.status)}`}>
            <div className="issue-header">
              <h3>{issue.title}</h3>
              <span className={`status ${getStatusColor(issue.status)}`}>
                {issue.status?.status_name || issue.status || 'Unknown'}
              </span>
            </div>
            <div className="issue-details">
              <p>{issue.description}</p>
              <div className="issue-meta">
                <span>Category: {issue.category}</span>
                <span>Priority: {issue.priority}</span>
                <span>Course: {issue.course_code}</span>
              </div>
            </div>
            <div className="issue-footer">
              <span className="timestamp">
                Submitted: {new Date(issue.reported_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {issues.length === 0 && (
          <div className="no-issues">
            <p>No issues found. Submit a new issue to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueTracking;
