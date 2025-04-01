import React from "react";
import "../styles/lecturerIssueList.css";

const LecturerIssueList = ({ onSelectIssue }) => {
  // Sample issues data
  const issues = [
    {
      id: 1,
      title: "Missing Lecture Notes",
      courseCode: "CSC 101",
      courseName: "Introduction to Computing",
      studentName: "John Doe",
      description: "Lecture notes for week 5 missing"
    },
    // Add more sample issues as needed
  ];

  return (
    <div className="issue-list-container">
      <h2>Unresolved Issues</h2>
      <div className="issues-grid">
        {issues.map(issue => (
          <div 
            key={issue.id}
            className="issue-card"
            onClick={() => {
              onSelectIssue(issue); // This should trigger the selection
              console.log("Issue selected:", issue.title); // For debugging
            }}
          >
            <h3>{issue.title}</h3>
            <p><strong>Course:</strong> {issue.courseCode}</p>
            <p><strong>Student:</strong> {issue.studentName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LecturerIssueList;