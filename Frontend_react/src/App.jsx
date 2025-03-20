import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LecturerDashboard from "./pages/LecturerDashboard"; // Ensure this import is correct
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import Verification from "./pages/Verification";
import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} /> {/* Ensure this route exists */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="*" element={<Home />} /> {/* Fallback to Home if route doesn't exist */}
      </Routes>
    </Router>
  );
};

export default App;