import React from "react";
import "../styles/lecturerResolvedIssues.css";

const LecturerResolvedIssues = () => {
  const resolvedIssues = [
    { id: 1, sn: "SN001", title: "Network Connectivity Issue", student: "Alex Chen", resolution: "Fixed by IT team" },
    { id: 2, sn: "SN002", title: "Assignment Submission Problem", student: "Emma William", resolution: "Resolved by lecturer" },
  ];

  return (
    <div className="resolved-issues">
      <h2>Resolved Issues</h2>
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th>Title</th>
            <th>Student</th>
            <th>Resolution</th>
          </tr>
        </thead>
        <tbody>
          {resolvedIssues.map((issue) => (
            <tr key={issue.id}>
              <td>{issue.sn}</td>
              <td>{issue.title}</td>
              <td>{issue.student}</td>
              <td>{issue.resolution}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LecturerResolvedIssues;