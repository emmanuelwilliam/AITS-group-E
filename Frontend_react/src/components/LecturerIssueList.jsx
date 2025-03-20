import React from "react";
import "../styles/lecturerIssueList.css";

const LecturerIssueList = () => {
  const issues = [
    { id: 1, sn: "SN001", title: "Network Connectivity Issue", student: "Alex Chen", status: "Pending" },
    { id: 2, sn: "SN002", title: "Assignment Submission Problem", student: "Emma William", status: "In Progress" },
  ];

  return (
    <div className="issue-list">
      <h2>Issue List</h2>
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th>Title</th>
            <th>Student</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.sn}</td>
              <td>{issue.title}</td>
              <td>{issue.student}</td>
              <td>{issue.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LecturerIssueList;