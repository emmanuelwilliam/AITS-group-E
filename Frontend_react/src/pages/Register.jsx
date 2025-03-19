import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [webmail, setWebmail] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({}); // Object to store field-specific errors
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validate each field
    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";
    if (!studentNumber) newErrors.studentNumber = "Student number is required.";
    if (!registrationNumber) newErrors.registrationNumber = "Registration number is required.";
    if (!webmail) newErrors.webmail = "Webmail is required.";
    if (!college) newErrors.college = "College is required.";
    if (!course) newErrors.course = "Course is required.";
    if (!newPassword) newErrors.newPassword = "New password is required.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors); // Update errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // Stop if validation fails

    // Simulate registration logic
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          studentNumber,
          registrationNumber,
          webmail,
          college,
          course,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to verification page with webmail
        navigate("/verify", { state: { email: webmail } });
      } else {
        setErrors({ form: data.message || "Registration failed. Please try again." });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ form: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        {errors.form && <p className="error">{errors.form}</p>} {/* Display form-level errors */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && <p className="field-error">{errors.firstName}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && <p className="field-error">{errors.lastName}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Student Number"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
            {errors.studentNumber && <p className="field-error">{errors.studentNumber}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Registration Number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
            {errors.registrationNumber && <p className="field-error">{errors.registrationNumber}</p>}
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Webmail"
              value={webmail}
              onChange={(e) => setWebmail(e.target.value)}
            />
            {errors.webmail && <p className="field-error">{errors.webmail}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="College"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
            {errors.college && <p className="field-error">{errors.college}</p>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
            {errors.course && <p className="field-error">{errors.course}</p>}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;