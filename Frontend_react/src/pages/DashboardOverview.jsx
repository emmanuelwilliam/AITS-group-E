import React from 'react';

const DashboardOverview = () => {
  return (
    <div className="dashboard-overview">
      <h2>Dashboard Overview</h2>
      <div className="overview-stats">
        <div className="stat-card">
          <h3>Total Issues</h3>
          {/* Add issue count */}
        </div>
        <div className="stat-card">
          <h3>Open Issues</h3>
          {/* Add open issues count */}
        </div>
        <div className="stat-card">
          <h3>Resolved Issues</h3>
          {/* Add resolved issues count */}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;// Export DashboardOverview component
