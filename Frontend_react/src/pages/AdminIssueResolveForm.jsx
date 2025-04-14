import React, { useState } from 'react';

const AdminIssueResolveForm = () => {
  const [resolution, setResolution] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic
  };

  return (
    <div className="issue-resolve-form">
      <h2>Resolve Issue</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Resolution Details</label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Resolution</button>
      </form>
    </div>
  );
};

export default AdminIssueResolveForm;