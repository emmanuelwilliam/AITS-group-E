import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../api/authService';
import '../styles/register.css';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    username: '', // Added username field to match Django User model
    firstName: '',
    lastName: '',
    studentNumber: '',
    registrationNumber: '',
    email: '', // Changed from webmail to email to match your User model
    college: '',
    course: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.studentNumber) newErrors.studentNumber = "Student number is required";
    if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.college) newErrors.college = "College is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare data in the format your backend expects
      const studentData = {
        user: {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'student' // This should match your UserRole choices
        },
        college: formData.college,
        email: formData.email, // Duplicated to match your Student model
        student_number: formData.studentNumber,
        registration_number: formData.registrationNumber,
        course: formData.course
      };

      await registerStudent(studentData);
      navigate('/verify', { state: { email: formData.email, role: 'student' } });
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({
        form: err.response?.data?.message || 
             err.message || 
             'Registration failed. Please try again.'
      });
      
      // Handle field-specific errors from backend
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const fieldErrors = {};
        
        // Map backend errors to form fields
        for (const key in backendErrors) {
          if (key in formData) {
            fieldErrors[key] = backendErrors[key].join(' ');
          }
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
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
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Student Number</label>
              <input
                type="text"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
                className={errors.studentNumber ? 'error' : ''}
              />
              {errors.studentNumber && <span className="error">{errors.studentNumber}</span>}
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className={errors.registrationNumber ? 'error' : ''}
              />
              {errors.registrationNumber && <span className="error">{errors.registrationNumber}</span>}
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

          <div className="form-row">
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
            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={errors.course ? 'error' : ''}
              />
              {errors.course && <span className="error">{errors.course}</span>}
            </div>
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
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