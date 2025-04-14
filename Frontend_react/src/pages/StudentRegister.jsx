import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/authService';  
import '../styles/register.css';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',  // Changed from firstName to match backend
    last_name: '',   // Changed from lastName to match backend
    email: '',
    college: '',
    password: '',
    confirm_password: ''  // Changed from confirmPassword to match backend
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

     // Required field validation
     const requiredFields = {
      username: "Username",
      first_name: "First name",
      last_name: "Last name",
      email: "Email",
      college: "College",
      password: "Password"
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${label} is required`;
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Password confirmation
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  setErrors({});

try {
  const studentData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      college: formData.college.trim(),
      role: 'student'
  };

  console.log('Submitting data:', studentData);
  
  const response = await registerStudent(studentData);

  // Check for tokens instead of token
  if (response && response.tokens) {
      // Store tokens
      localStorage.setItem('token', response.tokens.access);
      localStorage.setItem('refreshToken', response.tokens.refresh);
      
      navigate('/verify', { 
          state: { 
              email: formData.email, 
              role: 'student',
              message: 'Registration successful! Please verify your email'
          },
          replace: true 
      });
  } else {
      throw new Error('Registration failed. No tokens received.');
  }
} catch (err) {
  console.error('Registration error:', err);
  
  // Improved error handling
  if (err.response?.data?.error) {
      // Handle specific error from backend
      setErrors({
          form: err.response.data.error
      });
  } else if (err.response?.data) {
      // Handle validation errors
      const backendErrors = err.response.data;
      const fieldErrors = {};
      
      Object.entries(backendErrors).forEach(([key, value]) => {
          fieldErrors[key] = Array.isArray(value) ? value[0] : value;
      });

      setErrors({
          ...fieldErrors,
          form: 'Please correct the errors below.'
      });
  } else {
      // Handle other errors
      setErrors({
          form: err.message || 'Registration failed. Please try again later.'
      });
  }
} finally {
  setIsSubmitting(false);
}
};

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Student Registration</h2>
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? 'error' : ''}
              />
              {errors.first_name && <span className="error">{errors.first_name}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? 'error' : ''}
              />
              {errors.last_name && <span className="error">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>College</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleChange}
              className={errors.college ? 'error' : ''}
            />
            {errors.college && <span className="error">{errors.college}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={errors.confirm_password ? 'error' : ''}
              />
              {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentRegister;