import React from "react";
import "../styles/studentActivity.css";

const StudentActivity = () => {
  // Sample data - replace with real data from your backend
  const activities = [
    {
      id: 1,
      student: "John Doe (ST2023001)",
      action: "Submitted assignment",
      course: "Computer Science 101",
      time: "2 hours ago"
    },
    {
      id: 2,
      student: "Mary Smith (ST2023002)",
      action: "Posted forum question",
      course: "Mathematics 202",
      time: "4 hours ago"
    }
  ];

  return (
    <div className="student-activity">
      <h2>Student Activity Monitor</h2>
      
      <div className="activity-filters">
        <div className="filter-group">
          <label>Time Range:</label>
          <select>
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Activity Type:</label>
          <select>
            <option>All Activities</option>
            <option>Assignments</option>
            <option>Forum Posts</option>
            <option>Logins</option>
          </select>
        </div>
      </div>

      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-header">
              <span className="student">{activity.student}</span>
              <span className="time">{activity.time}</span>
            </div>
            <div className="activity-details">
              <span className="action">{activity.action}</span>
              <span className="course">{activity.course}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentActivity;