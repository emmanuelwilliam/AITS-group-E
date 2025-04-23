import React, { useState } from "react";
import "../styles/complaints.css";

const ComplaintsReport = () => {
  // Sample complaints data stored in state
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
    <div className="complaints-report"> {/* Main container for complaints report */}
      <h2>Complaints Management</h2> {/* Page heading */}
      
      {/* Action bar with a button to add new complaints and filters */}
      <div className="complaints-actions">
        <button className="btn-primary">+ New Complaint</button> {/* New complaint button */}

        {/* Filter and search controls */}
        <div className="filter-controls">
          <select> {/* Status filter dropdown */}
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          
          {/* Search input for filtering complaints */}
          <input type="text" placeholder="Search complaints..." />
        </div>
      </div>

      {/* Complaints data table */}
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
          {/* Map through complaints and render each one in a table row */}
          {complaints.map(complaint => (
            <tr key={complaint.id}>
              <td>{complaint.id}</td>
              <td>{complaint.studentId}</td>
              <td>{complaint.lecturer}</td>
              <td>{complaint.date}</td>
              <td>{complaint.category}</td>
              
              {/* Status with styling class based on status value */}
              <td>
                <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </span>
              </td>

              {/* Priority with styling class based on priority value */}
              <td>
                <span className={`priority-badge ${complaint.priority.toLowerCase()}`}>
                  {complaint.priority}
                </span>
              </td>

              {/* Action buttons for each complaint */}
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
