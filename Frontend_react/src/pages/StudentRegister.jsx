import React, { useState } from 'react'; // React and useState hook
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { registerStudent } from '../api/authService'; // API service to register students
import '../styles/register.css'; // CSS styling for the registration page

// Student registration component
const StudentRegister = () => {
  // State to manage form input values
  const [formData, setFormData] = useState({
    username: '', // Required for Django User model
    firstName: '',
    lastName: '',
    studentNumber: '',
    registrationNumber: '',
    email: '', // Matching Django's expected field
    college: '',
    course: '',
    password: '',
    confirmPassword: ''
  });

  // Error messages for fields or the whole form
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Tracks submission state
  const navigate = useNavigate(); // Navigation function

  // Update form state and clear error on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate inputs before submission
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

  // Submit handler for form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Structure payload for backend compatibility
      const studentData = {
        user: {
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'student' // Match your backend's user role field
        },
        college: formData.college,
        email: formData.email,
        student_number: formData.studentNumber,
        registration_number: formData.registrationNumber,
        course: formData.course
      };

      // Call API to register student
      await registerStudent(studentData);

      // Navigate to verification screen on success
      navigate('/verify', { state: { email: formData.email, role: 'student' } });
    } catch (err) {
      console.error('Registration error:', err);
      // Handle general error
      setErrors({
        form: err.response?.data?.message || 
              err.message || 
              'Registration failed. Please try again.'
      });

      // Extract and display field-specific errors from backend if any
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const fieldErrors = {};

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
      setIsSubmitting(false); // End submitting state
    }
  };

  // Render the registration form
  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Student Registration</h2>

        {/* General form error message */}
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Username */}
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

          {/* First & Last Name */}
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

          {/* Student & Registration Number */}
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

          {/* Email */}
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

          {/* College & Course */}
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

          {/* Password & Confirm Password */}
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

          {/* Submit button */}
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

export default StudentRegister; // Export the registration component
