import React from "react";
import "../styles/lecturerDashboard.css";

const LecturerIssueList = ({ issues, onIssueSelect }) => {
  return (
    <div className="issue-list">
      <h2>Assigned Issues</h2>
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="issue-item"
          onClick={() => onIssueSelect(issue)}
        >
          <h3>{issue.title}</h3>
          <p><strong>Student:</strong> {issue.studentName}</p>
          <p><strong>Status:</strong> {issue.status}</p>
        </div>
      ))}
    </div>
  );
};

export default LecturerIssueList;