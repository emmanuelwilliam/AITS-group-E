import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterRouter from "./pages/RegisterRouter";
import Verification from "./pages/Verification";
import Home from "./pages/Home";
import DashboardOverview from "./components/DashboardOverview";
import ComplaintsReport from "./components/ComplaintsReport";
import StudentActivity from "./components/StudentActivity";
import CollegeStatistics from "./components/CollegeStatistics";
import AdminIssueResolveForm from "./components/AdminIssueResolveForm";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />}>
          <Route index element={<DashboardOverview />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="complaints" element={<ComplaintsReport />} />
          <Route path="activity" element={<StudentActivity />} />
          <Route path="colleges" element={<CollegeStatistics />} />
          <Route path="resolve-issue" element={<AdminIssueResolveForm />} />
        </Route>
        <Route path="/register" element={<RegisterRouter />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;