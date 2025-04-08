import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/authService';
import '../styles/login.css';
import MakerereLogo from '../assets/Makerere Logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const role = location.state?.role || 'student';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = await login({ email, password, role });
      authLogin({ ...userData, rememberMe });
      
      switch (role) {
        case 'student': navigate('/dashboard'); break;
        case 'lecturer': navigate('/lecturer-dashboard'); break;
        case 'admin': navigate('/admin-dashboard'); break;
        default: navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      {/* ... (keep existing JSX structure) ... */}
    </div>
  );
};

export default Login;