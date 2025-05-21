import React, { useEffect, useState } from "react";
import "../styles/lecturerIssueList.css";
import api from "../api/apiConfig";

const LecturerIssueList = ({ onSelectIssue }) => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('issues/?assigned_to=me')
      .then(res => setIssues(res.data))
      .catch(() => setIssues([]));
  }, []);

  return (
    <div className="issue-list-container">
      <h2>Unresolved Issues</h2>
      <div className="issues-grid">
        {issues.map(issue => (
          <div 
            key={issue.id}
            className="issue-card"
            onClick={() => onSelectIssue(issue)}
          >
            <h3>{issue.title}</h3>
            <p><strong>Course:</strong> {issue.course_code || issue.courseCode}</p>
            <p><strong>Student:</strong> {issue.student_name || issue.studentName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LecturerIssueList;
