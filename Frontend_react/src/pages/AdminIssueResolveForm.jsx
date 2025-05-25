import React, { useState } from 'react';

const AdminIssueResolveForm = () => {
  const [resolution, setResolution] = useState('');

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axios.post();
      alert('Submission successful');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed');
    }
  };

  return (
    <div className="issue-resolve-form">
      <h1>Resolve Issue</h1>
      
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

export default AdminIssueResolveForm;// Export AdminIssueResolveForm component
