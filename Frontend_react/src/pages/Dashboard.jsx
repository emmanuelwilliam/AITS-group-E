import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Notifications from '../components/Notifications';
import IssueReporting from '../components/IssueReporting';
import IssueTracking from '../components/IssueTracking';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('notifications');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false since we're not loading
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Mock issues data
    const mockIssues = [
      {
        id: 1,
        title: "Network Connectivity",
        description: "Unable to access university WiFi",
        status: "Pending",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Library Access",
        description: "Student ID not working at library entrance",
        status: "In Progress",
        createdAt: new Date().toISOString()
      }
    ];

    setIssues(mockIssues);
  }, []);

  const handleIssueCreated = (newIssue) => {
    // For mock implementation, just add to local state
    const mockIssue = {
      ...newIssue,
      id: Math.max(...issues.map(i => i.id), 0) + 1,
      status: "Pending",
      createdAt: new Date().toISOString()
    };
    setIssues(prevIssues => [mockIssue, ...prevIssues]);
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

  // Rest of the component remains the same
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

export default Dashboard;