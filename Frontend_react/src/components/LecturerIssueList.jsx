import React from "react";

const LecturerIssueList = ({ issues, onIssueSelect }) => {
  return (
    <div className="issue-list">
      <h2>Assigned Issues</h2>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id} onClick={() => onIssueSelect(issue)}>
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>
            <p>Student: {issue.studentName}</p>
            <p>Status: {issue.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LecturerIssueList;