import React from "react";
import "../styles/dashboardOverview.css";

const DashboardOverview = () => {
  // Sample data - replace with real data from your backend
  const stats = [
    { title: "Pending Issues", value: 24, change: "+2" },
    { title: "Resolved Today", value: 8, change: "+3" },
    { title: "Active Students", value: 1423, change: "-12" },
    { title: "New Complaints", value: 5, change: "+1" }
  ];

  return (
    <div className="dashboard-overview">
      <h2>Administrator Dashboard</h2>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
              {stat.change} from yesterday
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {/* This would be populated with real data */}
          <div className="activity-item">
            <span className="time">10:30 AM</span>
            <span className="action">Resolved transcript issue for #ST20230045</span>
          </div>
          <div className="activity-item">
            <span className="time">09:15 AM</span>
            <span className="action">Received new complaint from Lecturer Muwanguzi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;