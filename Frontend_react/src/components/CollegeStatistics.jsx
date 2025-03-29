import React from "react";
import "../styles/collegeStats.css";

const CollegeStatistics = () => {
  // Sample data - replace with real data from your backend
  const colleges = [
    {
      name: "College of Computing",
      students: 1250,
      lecturers: 45,
      courses: 78,
      complaints: 12
    },
    {
      name: "College of Engineering",
      students: 980,
      lecturers: 38,
      courses: 65,
      complaints: 8
    }
  ];

  return (
    <div className="college-statistics">
      <h2>College Performance Statistics</h2>
      
      <div className="stats-controls">
        <div className="time-filter">
          <label>Academic Year:</label>
          <select>
            <option>2022/2023</option>
            <option>2021/2022</option>
            <option>2020/2021</option>
          </select>
        </div>
        <div className="export-options">
          <button className="btn-export">Export as CSV</button>
          <button className="btn-export">Export as PDF</button>
        </div>
      </div>

      <table className="college-stats-table">
        <thead>
          <tr>
            <th>College</th>
            <th>Students</th>
            <th>Lecturers</th>
            <th>Courses</th>
            <th>Complaints</th>
            <th>Complaint Rate</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map((college, index) => (
            <tr key={index}>
              <td>{college.name}</td>
              <td>{college.students}</td>
              <td>{college.lecturers}</td>
              <td>{college.courses}</td>
              <td>{college.complaints}</td>
              <td>{(college.complaints / college.students * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Student Distribution</h3>
          <div className="chart-placeholder">
            {/* Chart would be rendered here with a library like Chart.js */}
            [Student Distribution Chart]
          </div>
        </div>
        <div className="chart-container">
          <h3>Complaint Trends</h3>
          <div className="chart-placeholder">
            {/* Chart would be rendered here with a library like Chart.js */}
            [Complaint Trends Chart]
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeStatistics;