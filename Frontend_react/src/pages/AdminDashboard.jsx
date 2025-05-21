import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopBar from "../components/AdminTopBar";
import AdminStatCard from "../components/AdminStatCard";
import "../styles/adminDashboard.css";
import logo from "../assets/Makerere Logo.png";
import { fetchAdminStatistics } from "../api/issueService";

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName = "Admin", lastName = "User", email = "admin@mak.ac.ug" } =
    location?.state || {};

  const [activeSection, setActiveSection] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(window.innerWidth < 768);
  const [issueSummary, setIssueSummary] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    total: 0,
  });
  const [statsError, setStatsError] = useState(null);

  // Responsive menu toggle on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMenuCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load notifications and stats
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: "New urgent issue reported", read: false, time: "10 mins ago" },
      { id: 2, title: "Weekly report ready", read: true, time: "2 hours ago" },
      { id: 3, title: "System backup completed", read: true, time: "Yesterday" },
    ];
    setNotifications(mockNotifications);
    setHasUnread(mockNotifications.some((n) => !n.read));
    fetchIssueSummary();
  }, []);

  // Fetch real admin statistics from backend
  const fetchIssueSummary = async () => {
    try {
      const stats = await fetchAdminStatistics();
      setIssueSummary({
        open: stats.issues_by_status.find(s => s.status__status_name === 'Open')?.count || 0,
        inProgress: stats.issues_by_status.find(s => s.status__status_name === 'In Progress')?.count || 0,
        resolved: stats.issues_by_status.find(s => s.status__status_name === 'Resolved')?.count || 0,
        total: stats.total_issues || 0,
      });
      setStatsError(null);
    } catch (err) {
      setIssueSummary({ open: 0, inProgress: 0, resolved: 0, total: 0 });
      setStatsError("Failed to load statistics");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("adminToken");
      navigate("/");
    }
  };

  const toggleMenu = () => setMenuCollapsed((prev) => !prev);

  const markNotificationRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setHasUnread(updated.some((n) => !n.read));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasUnread(false);
  };

  return (
    <div className="admin-dashboard">
      <AdminTopBar
        firstName={firstName}
        lastName={lastName}
        email={email}
        role="Administrator"
        institutionName="Makerere University"
        logo={logo}
        onLogout={handleLogout}
        toggleMenu={toggleMenu}
        notifications={notifications}
        hasUnread={hasUnread}
        markNotificationRead={markNotificationRead}
        markAllRead={markAllRead}
      />

      <div className="dashboard-container">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          collapsed={menuCollapsed}
          issueSummary={issueSummary}
        />

        <main className={`main-content ${menuCollapsed ? "expanded" : ""}`}>
          {/* Stats Summary Cards */}
          {statsError && <div className="error-message">{statsError}</div>}
          <div className="admin-stats-summary">
            <AdminStatCard label="Open Issues" value={issueSummary.open} />
            <AdminStatCard label="In Progress" value={issueSummary.inProgress} />
            <AdminStatCard label="Resolved" value={issueSummary.resolved} />
            <AdminStatCard label="Total Issues" value={issueSummary.total} />
          </div>

          {/* Nested Routes */}
          <Outlet
            context={{
              refreshData: fetchIssueSummary,
              adminName: `${firstName} ${lastName}`,
              adminEmail: email,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
