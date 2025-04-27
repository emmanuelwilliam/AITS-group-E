// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext';
import { fetchIssues } from '../api/issueService';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Notifications from '../components/Notifications';
import IssueReporting from '../components/IssueReporting';
import IssueTracking from '../components/IssueTracking';
import IssueStatsCard from '../components/IssueStatsCard';
import '../styles/dashboard.css';

const StudentDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('notifications');
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Load issues whenever the user changes or on mount
  useEffect(() => {
    if (!user) return;
    loadIssues();
  }, [user]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchIssues();
      setIssues(res.data);
      setFilteredIssues(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load issues. Please try again.');
      if (err.response?.status === 401) {
        handleLogout(); // Call handleLogout if unauthorized
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/'); // Redirect to the home screen
  };

  // Apply search/filter/sort
  useEffect(() => {
    let data = [...issues];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(i => i.status?.id === statusFilter);
    }

    data.sort((a,b) => {
      const da = new Date(a.reported_date);
      const db = new Date(b.reported_date);
      return sortOrder === 'newest' ? db - da : da - db;
    });

    setFilteredIssues(data);
  }, [issues, searchQuery, statusFilter, sortOrder]);

  const flashMessage = msg => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleIssueCreated = newIssue => {
    setIssues(prev => [newIssue, ...prev]);
    setActiveComponent('issueTracking');
    flashMessage('Issue submitted successfully!');
  };

  const handleIssueUpdated = updated =>
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));

  const handleIssueDeleted = id =>
    setIssues(prev => prev.filter(i => i.id !== id));

  const renderContent = () => {
    if (loading) return <p>Loading issues…</p>;
    if (error)   return <div className="error">{error}</div>;

    switch(activeComponent) {
      case 'issueReporting':
        return (
          <IssueReporting
            onIssueCreated={handleIssueCreated}
            userRole="student"
            user={user}
          />
        );
      case 'issueTracking':
        return (
          <IssueTracking
            issues={filteredIssues}
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={handleIssueDeleted}
            userRole="student"
            onSearch={setSearchQuery}
            onFilterChange={setStatusFilter}
            onSortChange={setSortOrder}
          />
        );
      default:
        return <Notifications />;
    }
  };

  const issueStats = {
    total:    issues.length,
    low:      issues.filter(i => i.priority==='Low').length,
    medium:   issues.filter(i => i.priority==='Medium').length,
    high:     issues.filter(i => i.priority==='High').length,
    urgent:   issues.filter(i => i.priority==='Urgent').length,
  };

  return (
    <div className="dashboard">
      {statusMessage && <div className="flash">{statusMessage}</div>}

      <TopBar user={user} toggleSidebar={() => {/*…*/}} />

      <Sidebar
        active={activeComponent}
        onSelect={setActiveComponent}
        userRole="student"
      />

      <div className="main-content">
        <div className="stats">
          {Object.entries(issueStats).map(([key, val]) =>
            <IssueStatsCard
              key={key}
              label={key}
              value={val}
              onClick={() => setStatusFilter(key)}
              active={statusFilter === key}
            />
          )}
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
