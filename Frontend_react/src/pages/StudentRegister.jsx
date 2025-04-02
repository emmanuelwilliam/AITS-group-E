import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentNumber: "",
    registrationNumber: "",
    webmail: "",
    college: "",
    course: "",
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
    if (!formData.studentNumber) newErrors.studentNumber = "Student number is required";
    if (!formData.registrationNumber) newErrors.registrationNumber = "Registration number is required";
    if (!formData.webmail) newErrors.webmail = "Webmail is required";
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
    
    try {
      const response = await fetch("/api/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "student" })
      });
      
      const data = await response.json();
      if (response.ok) {
        navigate("/verify", { state: { email: formData.webmail, role: "student" } });
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
        <h2>Student Registration</h2>
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

          <div className="form-row">
            <div className="form-group">
              <label>Student Number</label>
              <input
                type="text"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
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
              />
              {errors.registrationNumber && <span className="error">{errors.registrationNumber}</span>}
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
              <label>College</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
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

export default StudentRegister;