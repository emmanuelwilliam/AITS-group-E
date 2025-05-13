import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/complaints.css";

const ComplaintsReport = () => {
  const [complaints, setComplaints] = useState([]);
  const [sortField, setSortField] = useState("date"); // Default sort field
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get("/api/issues/"); // Adjust the URL if needed
        setComplaints(response.data);
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
      }
    };

    fetchComplaints();
  }, []);

  // Function to handle sorting
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedComplaints = [...complaints].sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });

    setComplaints(sortedComplaints);
  };

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
            <th onClick={() => handleSort("id")}>ID</th>
            <th onClick={() => handleSort("studentId")}>Student</th>
            <th onClick={() => handleSort("lecturer")}>Lecturer</th>
            <th onClick={() => handleSort("date")}>Date</th>
            <th onClick={() => handleSort("category")}>Category</th>
            <th onClick={() => handleSort("status")}>Status</th>
            <th onClick={() => handleSort("priority")}>Priority</th>
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
