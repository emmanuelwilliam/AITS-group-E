import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "../styles/register.css";

const LecturerRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    webmail: "",
    contact: "",
    department: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Ensure unique username by appending timestamp
      const username = formData.webmail + '_' + Date.now();
      await authService.registerLecturer({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.webmail,
        username,
        contact_number: formData.contact,
        department: formData.department,
        password: formData.password
      });
      navigate("/verify", {
        state: { email: formData.webmail, role: "lecturer" }
      });
    } catch (error) {
      console.error("Registration Error:", error);
      setErrors({ form: error.message || "Registration failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Lecturer Registration</h2>
        {errors.form && <div className="error-message">{errors.form}</div>}
        <form onSubmit={handleSubmit}>
          {/* First and Last Name Row */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

          {/* Webmail Input */}
          <div className="form-group">
            <label>Webmail</label>
            <input
              type="email"
              name="webmail"
              value={formData.webmail}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.webmail && <span className="error">{errors.webmail}</span>}
          </div>

          {/* Contact and Department Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.department && <span className="error">{errors.department}</span>}
            </div>
          </div>

          {/* Password and Confirm Password Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LecturerRegister;