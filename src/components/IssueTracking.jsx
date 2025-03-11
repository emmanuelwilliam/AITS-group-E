import React from "react";
import "../styles/issueTracking.css";

const IssueTracking = () => {
  // Sample data for issues
  const issues = [
    {
      id: 1,
      title: "Missing Marks for CSC 1202",
      description: "My marks for the Software Development Project are missing.",
      status: "Submitted",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Course Registration Issue",
      description: "Unable to register for CSC 1202.",
      status: "Pending",
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "Incorrect Transcript",
      description: "My transcript shows incorrect grades.",
      status: "Resolved",
      date: "2024-01-05",
    },
  ];

  return (
    <div className="issue-tracking">
      <h2>Issue Tracking</h2>
      <div className="issues-list">
        {issues.map((issue) => (
          <div key={issue.id} className={`issue-card ${issue.status.toLowerCase()}`}>
            <div className="issue-header">
              <h3>{issue.title}</h3>
              <span className={`status ${issue.status.toLowerCase()}`}>{issue.status}</span>
            </div>
            <p>{issue.description}</p>
            <div className="issue-footer">
              <span>Date: {issue.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTracking;