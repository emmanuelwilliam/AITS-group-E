import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    if (!validateForm()) return;
    
    try {
      const response = await fetch("/api/register/lecturer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "lecturer" })
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate("/verify", { state: { email: formData.webmail, role: "lecturer" } });
      } else {
        setErrors({ form: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ form: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Lecturer Registration</h2>
        {errors.form && <div className="error-message">{errors.form}</div>}
        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="submit-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default LecturerRegister;