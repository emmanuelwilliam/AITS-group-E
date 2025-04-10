import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/authService";
import "../styles/login.css";
import MakerereLogo from "../assets/Makerere Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const role = location.state?.role || "student";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      // Use the authService login function instead of direct fetch
      const { token, refresh, user } = await login({ 
        username: email,  // Django typically uses 'username' field
        password,
        role 
      });

      // Use the auth context to handle login
      authLogin({
        token,
        refresh,
        user,
        rememberMe
      });

      // Redirect based on role
      switch (user.role?.toLowerCase()) {
        case "student":
          navigate("/dashboard");
          break;
        case "lecturer":
          navigate("/lecturer-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.detail || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
        <h2>Welcome to MAK Academic Issue Tracking System</h2>
        <p className="role-info">Logging in as: {role.charAt(0).toUpperCase() + role.slice(1)}</p>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email/Username</label>
            <div className="input-container">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                id="email"
                type="text"  // Changed to text to allow both email and username
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <div className="options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
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

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{" "}
          <button 
            onClick={() => navigate("/register", { state: { role } })}
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