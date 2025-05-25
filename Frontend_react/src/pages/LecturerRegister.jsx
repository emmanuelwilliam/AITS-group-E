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
    college: "",
    password: "",
    confirmPassword: ""
  });

  // List of colleges
  const colleges = [
    "College of Computing and IT",
    "College of Engineering",
    "College of Science",
    "College of Business",
    "College of Education",
    "College of Health Sciences"
  ];

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contact') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      }
    } else if (name === 'webmail') {
      // Convert webmail to lowercase
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.webmail) {
      newErrors.webmail = "Webmail is required";
    } else if (!formData.webmail.endsWith('@mak.ac.ug')) {
      newErrors.webmail = "Please use your Makerere University webmail (@mak.ac.ug)";
    }
    if (!formData.contact) {
      newErrors.contact = "Contact is required";
    } else if (!/^07\d{8}$/.test(formData.contact)) {
      newErrors.contact = "Please enter a valid phone number starting with '07' (e.g., 0712345678)";
    }
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.college) newErrors.college = "College is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
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
      const username = formData.webmail + '_' + Date.now();
      await authService.registerLecturer({
        user: {
          username: username,
          email: formData.webmail,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          role_name: "lecturer"
        },
        employee_id: username,
        department: formData.department,
        contact_number: formData.contact,
        college: formData.college,
        position: 'Lecturer'
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

          {/* College Selection */}
          <div className="form-group">
            <label>College</label>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              disabled={isSubmitting}
              className="select-input"
            >
              <option value="">Select your college</option>
              {colleges.map((college, index) => (
                <option key={index} value={college}>{college}</option>
              ))}
            </select>
            {errors.college && <span className="error">{errors.college}</span>}
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