import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentIssues } from '../api/issueService';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Notifications from '../components/Notifications';
import IssueReporting from '../components/IssueReporting';
import IssueTracking from '../components/IssueTracking';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState('notifications');
  const [issues, setIssues] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchIssues = async () => {
      if (user?.role === 'student') {
        const data = await getStudentIssues();
        setIssues(data);
      }
    };
    fetchIssues();
  }, [user]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'notifications': return <Notifications />;
      case 'issueReporting': return <IssueReporting />;
      case 'issueTracking': return <IssueTracking issues={issues} />;
      default: return <Notifications />;
    }
  };

  return (
    <div className="dashboard">
      <TopBar user={user} />
      <Sidebar setActiveComponent={setActiveComponent} />
      <div className="main-content">
        <div className="content">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default Dashboard;