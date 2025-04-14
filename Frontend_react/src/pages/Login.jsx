import React, { useState } from "react"; // React and useState hook
import { useNavigate, useLocation } from "react-router-dom"; // Navigation and location hooks
import { useAuth } from "../context/AuthContext"; // Custom auth context hook
import { login } from "../api/authService"; // API call to handle login
import "../styles/login.css"; // Login form styling

// Asset and icon imports
import MakerereLogo from "../assets/Makerere Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Login component definition
const Login = () => {
  // State variables to track form inputs and UI behavior
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation(); // Access passed location state
  const navigate = useNavigate(); // Navigation hook
  const { login: authLogin } = useAuth(); // Auth context login method

  // Determine role passed via location or default to "student"
  const role = location.state?.role || "student";

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(""); // Clear any previous error
    setIsLoading(true); // Show loading state

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      // Call login API with credentials and role
      const { token, refresh, user } = await login({ 
        username: email, // 'username' used for Django compatibility
        password,
        role 
      });

      // Store login data in auth context
      authLogin({
        token,
        refresh,
        user,
        rememberMe
      });

      // Redirect based on user role
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
      console.error("Login error:", err); // Log any errors
      setError(
        err.response?.data?.detail || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // JSX return for login form
  return (
    <div className="login-container">
      <div className="login-box">
        <img src={MakerereLogo} alt="Makerere University Logo" className="logo" />
        <h2>Welcome to MAK Academic Issue Tracking System</h2>
        <p className="role-info">Logging in as: {role.charAt(0).toUpperCase() + role.slice(1)}</p>
        
        {/* Error message if login fails */}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email/Username input */}
          <div className="input-group">
            <label htmlFor="email">Email/Username</label>
            <div className="input-container">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                id="email"
                type="text" // Support both email and usernames
                placeholder="Enter your email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password input with show/hide toggle */}
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

          {/* Remember me and forgot password options */}
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

          {/* Login button */}
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Registration redirect */}
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

export default Login; // Export login component
