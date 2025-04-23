// src/components/IssueStatsCard.jsx

import React from 'react';
import '../styles/issueStatsCard.css'; // optional styling if you want

const IssueStatsCard = ({ label, value, onClick, active }) => {
  return (
    <div 
      className={`issue-stats-card ${active ? 'active' : ''}`} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

export default IssueStatsCard;
