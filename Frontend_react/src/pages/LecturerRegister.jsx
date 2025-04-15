import React, { useState } from "react"; // React and useState hook
import { useNavigate } from "react-router-dom"; // Hook to navigate programmatically
import "../styles/register.css"; // CSS for registration styling

// Component for lecturer registration form
const LecturerRegister = () => {
  // State to track form input values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    webmail: "",
    contact: "",
    department: "",
    password: "",
    confirmPassword: ""
  });

  // State to track form validation errors
  const [errors, setErrors] = useState({});

  const navigate = useNavigate(); // Hook to redirect after registration

  // Update formData when an input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Function to validate the form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.webmail) newErrors.webmail = "Webmail is required";
    if (!formData.contact) newErrors.contact = "Contact is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form and handle registration logic
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit behavior
    if (!validateForm()) return; // Stop if form is invalid

    try {
      // Send registration data to backend
      const response = await fetch("/api/register/lecturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "lecturer" }) // Include role in request
      });

      const data = await response.json(); // Parse response

      if (response.ok) {
        // Redirect to verification page if successful
        navigate("/verify", { state: { email: formData.webmail, role: "lecturer" } });
      } else {
        // Show error message from response
        setErrors({ form: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Error:", error); // Log unexpected error
      setErrors({ form: "An error occurred. Please try again." }); // Show generic error message
    }
  };

  // JSX for the registration form layout
  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Lecturer Registration</h2>
        {/* Show form-level error if any */}
        {errors.form && <div className="error-message">{errors.form}</div>}
        <form onSubmit={handleSubmit}>
          {/* First and Last Name */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
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
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Webmail input */}
          <div className="form-group">
            <label>Webmail</label>
            <input
              type="email"
              name="webmail"
              value={formData.webmail}
              onChange={handleChange}
            />
            {errors.webmail && <span className="error">{errors.webmail}</span>}
          </div>

          {/* Contact and Department */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
              {errors.contact && <span className="error">{errors.contact}</span>}
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
              {errors.department && <span className="error">{errors.department}</span>}
            </div>
          </div>

          {/* Password and Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default LecturerRegister; // Export LecturerRegister component
