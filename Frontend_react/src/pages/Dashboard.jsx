import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentIssues, getAllIssues } from '../api/issueService';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Notifications from '../components/Notifications';
import IssueReporting from '../components/IssueReporting';
import IssueTracking from '../components/IssueTracking';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('notifications');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch issues based on user role
        const data = user?.role === 'student' 
          ? await getStudentIssues() 
          : await getAllIssues();
        
        setIssues(data);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again.');
        
        // Handle unauthorized error (e.g., token expired)
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [user, logout]);

  const handleIssueCreated = (newIssue) => {
    setIssues(prevIssues => [newIssue, ...prevIssues]);
    setActiveComponent('issueTracking');
  };

  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  const handleIssueDeleted = (issueId) => {
    setIssues(prevIssues => 
      prevIssues.filter(issue => issue.id !== issueId)
    );
  };

  const renderComponent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (activeComponent) {
      case 'notifications':
        return <Notifications />;
      case 'issueReporting':
        return <IssueReporting onIssueCreated={handleIssueCreated} />;
      case 'issueTracking':
        return (
          <IssueTracking 
            issues={issues} 
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={handleIssueDeleted}
            userRole={user?.role}
          />
        );
      default:
        return <Notifications />;
    }
  };

  return (
    <div className="dashboard">
      <TopBar user={user} />
      <Sidebar 
        setActiveComponent={setActiveComponent} 
        activeComponent={activeComponent}
        userRole={user?.role}
      />
      <div className="main-content">
        <div className="content">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;