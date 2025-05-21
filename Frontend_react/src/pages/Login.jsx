import React, { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const roleDefault = (location.state?.role || "student").toLowerCase();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email/username and password");
      return;
    }
    setIsLoading(true);
    try {
      // Perform login via context (sets tokens + currentUser)
      console.log("→ Sending login:", { username: email.trim(), password });
      const currentUser = await authLogin({
        username: email.trim(),
        password,
        rememberMe,
      });
      console.log("← Current user:", currentUser);

      // Normalize role: could be string or object
      const rawRole =
        typeof currentUser.role === 'string'
          ? currentUser.role
          : currentUser.role?.name;
      const normalizedRole = rawRole?.toLowerCase() || roleDefault;
      const destination = roleRoutes[normalizedRole] || "/dashboard";

      navigate(destination);
    } catch (err) {
      setError(
        err?.error || err?.detail || err?.message || "Login failed. Please check your credentials."
      );
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

        {error && <div className="error-message" role="alert">{error}</div>}

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
                onClick={() => setShowPassword(prev => !prev)}
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
                onChange={() => setRememberMe(prev => !prev)}
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
          Don't have an account?{' '}
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
