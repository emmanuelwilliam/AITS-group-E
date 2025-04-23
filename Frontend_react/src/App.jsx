import ErrorBoundary from "./components/Errorboundary";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterRouter from "./pages/RegisterRouter";
import Verification from "./pages/Verification";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Dashboard components
import DashboardOverview from "./components/DashboardOverview";
import ComplaintsReport from "./components/ComplaintsReport";
import StudentActivity from "./components/StudentActivity";
import CollegeStatistics from "./components/CollegeStatistics";
import AdminIssueResolveForm from "./components/AdminIssueResolveForm";
import StudentRegister from "./pages/StudentRegister";
import VerifyEmail from "./pages/Verification";

const App = () => {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Router future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true 
      }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterRouter />} />
          <Route path="/register/student" element={<StudentRegister/>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="complaints" element={<ComplaintsReport />} />
            <Route path="activity" element={<StudentActivity />} />
            <Route path="colleges" element={<CollegeStatistics />} />
            <Route path="resolve-issue" element={<AdminIssueResolveForm />} />
          </Route>
          
          {/* Other Routes */}
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;// Export the component for the App
