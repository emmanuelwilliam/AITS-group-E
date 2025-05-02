import React, { useEffect, useState } from "react";
import "../styles/issueTracking.css";
import { getStudentIssues } from "../api/issueService"; // Import the API service

const IssueTracking = () => {
  const [issues, setIssues] = useState([]); // State to store issues
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await getStudentIssues(); // Fetch issues from the backend
        setIssues(response.data); // Update the state with fetched issues
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again later.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return <div className="loading">Loading issues...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="issue-tracking">
      <h2>Issue Tracking</h2>
      <div className="issues-list">
        {issues.length === 0 ? (
          <p>No issues found.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className={`issue-card ${issue.status.toLowerCase()}`}>
              <div className="issue-header">
                <h3>{issue.title}</h3>
                <span className={`status ${issue.status.toLowerCase()}`}>{issue.status}</span>
              </div>
              <p>{issue.description}</p>
              <div className="issue-footer">
                <span>Date: {issue.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IssueTracking;
