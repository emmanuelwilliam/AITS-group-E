import React from 'react';

const StudentActivity = () => {
  return (
    <div className="student-activity">
      <h2>Student Activity</h2>
      <div className="activity-timeline">
        {/* Add activity timeline or list */}
        <div className="activity-filters">
          <select>
            <option value="all">All Activities</option>
            <option value="issues">Issues</option>
            <option value="comments">Comments</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default StudentActivity;