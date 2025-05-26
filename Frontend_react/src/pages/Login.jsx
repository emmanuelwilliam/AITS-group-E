import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2"; // Import SweetAlert2
import "../styles/login.css";
import MakerereLogo from "../assets/Makerere Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const roleRoutes = {
  student: "/dashboard",
  lecturer: "/lecturer-dashboard",
  admin: "/admin-dashboard",
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const roleDefault = (location.state?.role || "student").toLowerCase();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions

    if (!email.trim() || !password) {
      Swal.fire({
        title: "Error",
        text: "Please enter both email/username and password.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await authLogin({
        username: email.trim(),
        password,
        rememberMe,
      });

      const rawRole =
        typeof currentUser.role === "string"
          ? currentUser.role
          : currentUser.role?.name;
      const normalizedRole = rawRole?.toLowerCase() || roleDefault;
      const destination = roleRoutes[normalizedRole] || "/dashboard";

      Swal.fire({
        title: "Success",
        text: `Successfully logged in as ${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}.`,
        icon: "success",
        confirmButtonText: "Proceed",
      });

      navigate(destination);
    } catch (err) {
      console.error(err); // Log the error for debugging
      Swal.fire({
        title: "Login Failed",
        text: err?.message || "Please check your credentials.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, rememberMe, authLogin, navigate, roleDefault]);

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
        <h2>Welcome to MAK Academic Issue Tracking System</h2>
        <p className="role-info">
          Logging in as: {roleDefault.charAt(0).toUpperCase() + roleDefault.slice(1)}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email/Username</label>
            <div className="input-container">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                id="email"
                name="email"
                type="text"
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                aria-label="Email or Username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle-button"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register", { state: { role: roleDefault } })}
            className="register-btn"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
