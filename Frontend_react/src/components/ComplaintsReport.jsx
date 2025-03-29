import React, { useState } from "react";
import "../styles/complaints.css";

const ComplaintsReport = () => {
  const [complaints] = useState([
    {
      id: 1,
      studentId: "ST2023001",
      lecturer: "Dr. Muwanguzi",
      date: "2023-06-15",
      category: "Grading",
      status: "Pending",
      priority: "High"
    },
    {
      id: 2,
      studentId: "ST2023002",
      lecturer: "Prof. Nalweyiso",
      date: "2023-06-14",
      category: "Attendance",
      status: "In Progress",
      priority: "Medium"
    }
  ]);

  return (
    <div className="complaints-report">
      <h2>Complaints Management</h2>
      
      <div className="complaints-actions">
        <button className="btn-primary">+ New Complaint</button>
        <div className="filter-controls">
          <select>
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <input type="text" placeholder="Search complaints..." />
        </div>
      </div>

      <table className="complaints-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Lecturer</th>
            <th>Date</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map(complaint => (
            <tr key={complaint.id}>
              <td>{complaint.id}</td>
              <td>{complaint.studentId}</td>
              <td>{complaint.lecturer}</td>
              <td>{complaint.date}</td>
              <td>{complaint.category}</td>
              <td><span className={`status-badge ${complaint.status.toLowerCase()}`}>
                {complaint.status}
              </span></td>
              <td><span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                {complaint.priority}
              </span></td>
              <td>
                <button className="btn-action">View</button>
                <button className="btn-action">Resolve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComplaintsReport;