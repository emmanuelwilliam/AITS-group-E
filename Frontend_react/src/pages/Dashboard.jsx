import React, { useState, useEffect } from 'react'; // Import React with hooks
import { useAuth } from '../context/AuthContext'; // Custom auth context hook
import { getStudentIssues, getAllIssues } from '../api/issueService'; // API functions to fetch issues
import Sidebar from '../components/Sidebar'; // Sidebar component
import TopBar from '../components/TopBar'; // Top navigation bar
import Notifications from '../components/Notifications'; // Component to show notifications
import IssueReporting from '../components/IssueReporting'; // Component for reporting issues
import IssueTracking from '../components/IssueTracking'; // Component for tracking issues
import '../styles/dashboard.css'; // Import CSS styling

// Main Dashboard component
const Dashboard = () => {
  // State to control which component is visible
  const [activeComponent, setActiveComponent] = useState('notifications');

  // State to hold list of issues
  const [issues, setIssues] = useState([]);

  // Loading and error state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the current user and logout method from auth context
  const { user, logout } = useAuth();

  // Fetch issues on component mount or when user changes
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Conditionally fetch issues based on user role
        const data = user?.role === 'student' 
          ? await getStudentIssues() 
          : await getAllIssues();
        
        setIssues(data); // Set fetched issues
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again.');

        // Auto-logout on unauthorized (401) error
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false); // Stop loading regardless of outcome
      }
    };

    fetchIssues(); // Call the fetch function
  }, [user, logout]); // Dependencies

  // Add a newly created issue to the top of the list
  const handleIssueCreated = (newIssue) => {
    setIssues(prevIssues => [newIssue, ...prevIssues]);
    setActiveComponent('issueTracking'); // Navigate to tracking view
  };

  // Update an existing issue in the list
  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };

  // Remove an issue from the list
  const handleIssueDeleted = (issueId) => {
    setIssues(prevIssues => 
      prevIssues.filter(issue => issue.id !== issueId)
    );
  };

  // Conditionally render the component based on active state
  const renderComponent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    // Render the appropriate child component
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
        return <Notifications />; // Fallback to notifications
    }
  };

  // JSX layout of the Dashboard
  return (
    <div className="dashboard">
      <TopBar user={user} /> {/* Top bar with user info */}
      <Sidebar 
        setActiveComponent={setActiveComponent} 
        activeComponent={activeComponent}
        userRole={user?.role}
      />
      <div className="main-content">
        <div className="content">
          {renderComponent()} {/* Render selected section */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; // Export the component
