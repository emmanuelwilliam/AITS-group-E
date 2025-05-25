import React, { useEffect, useState } from 'react';
import { fetchIssues } from '../api/issueService'; // Make sure path is correct

const ComplaintsReport = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await fetchIssues(); // This should return issue data array
        setIssues(data); // Adjust this if fetchIssues returns `data.issues` instead
      } catch (err) {
        console.error('Failed to fetch issues:', err);
        setError('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, []);

  return (
    <div className="complaints-report">
      <h2>Complaints Report</h2>

      {loading && <p>Loading issues...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="complaints-list">
          <table>
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="5">No issues found.</td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.id}</td>
                    <td>{issue.student?.user?.first_name || 'N/A'}</td>
                    <td>{issue.category?.name || 'N/A'}</td>
                    <td className={`status ${issue.status?.status_name?.toLowerCase?.().replace(/\s+/g, '-') || 'unknown'}`}>
                      {issue.status?.status_name || 'Unknown'}
                    </td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComplaintsReport;
