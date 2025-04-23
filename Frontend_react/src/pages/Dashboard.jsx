import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentIssues } from '../api/issueService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchStudentIssues();

    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  const fetchStudentIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentIssues();
      setIssues(data);
      setFilteredIssues(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('We couldn’t load your issues. Please refresh or try again.');
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!issues.length) return;
    let result = [...issues];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        i => i.title?.toLowerCase().includes(query) ||
             i.description?.toLowerCase().includes(query) ||
             i.id?.toString().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(issue => issue.status === statusFilter);
    }

    result.sort((a, b) => {
      const aDate = new Date(a.createdAt || a.timestamp);
      const bDate = new Date(b.createdAt || b.timestamp);
      return sortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });

    setFilteredIssues(result);
  }, [issues, searchQuery, statusFilter, sortOrder]);

  const handleIssueCreated = (newIssue) => {
    setIssues(prev => [newIssue, ...prev]);
    setActiveComponent('issueTracking');
    flashMessage('Issue submitted successfully. We’ll review it soon.');
  };

  const handleIssueUpdated = (updated) => {
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
    flashMessage('Issue updated.');
  };

  const handleIssueDeleted = (issueId) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    flashMessage('Issue removed.');
  };

  const flashMessage = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const issueStats = {
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    total: issues.length,
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderContent = () => {
    if (loading) return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading issues...</p>
      </div>
    );

    if (error) return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchStudentIssues}>Reload</button>
      </div>
    );

    switch (activeComponent) {
      case 'notifications':
        return <Notifications />;
      case 'issueReporting':
        return <IssueReporting onIssueCreated={handleIssueCreated} userRole="student" />;
      case 'issueTracking':
        return (
          <IssueTracking
            issues={filteredIssues}
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={handleIssueDeleted}
            userRole="student"
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            onFilterChange={setStatusFilter}
            currentFilter={statusFilter}
            onSortChange={setSortOrder}
            currentSort={sortOrder}
            refreshData={fetchStudentIssues}
          />
        );
      default:
        return <Notifications />;
    }
  };

  return (
    <div className="dashboard">
      {statusMessage && <div className="status-message">{statusMessage}</div>}

      <TopBar
        user={user}
        toggleSidebar={toggleSidebar}
        issueStats={issueStats}
        refreshData={fetchStudentIssues}
      />

      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
        userRole="student"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="stats-summary">
          {Object.entries(issueStats).map(([key, val]) => (
            <IssueStatsCard
              key={key}
              label={key.replace(/([A-Z])/g, ' $1')}
              value={val}
              onClick={() => setStatusFilter(key === 'total' ? 'all' : key)}
              active={statusFilter === key}
            />
          ))}
        </div>
        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
