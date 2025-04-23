import React from "react";
import "../styles/adminDashboard.css";

const AdminStatCard = ({ label, value }) => {
  return (
    <div className="stats-card">
      <h3>{label}</h3>
      <p className="stat-count">{value}</p>
    </div>
  );
};

export default AdminStatCard;
