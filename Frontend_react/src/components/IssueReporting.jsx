import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { createIssue } from "../api/issueService";
import "../styles/issueReporting.css";

const IssueReporting = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    college: "",
    program: "",
    yearOfStudy: "",
    semester: "",
    courseUnit: "",
    courseCode: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colleges = [
    "COCIS",
    "CEES",
    "CEDAT",
    "CHUSS",
    "CONAS",
    "CAES",
    "COBAMS",
    "SCHOOL OF LAW"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate required fields
    const requiredFields = Object.entries(formData).filter(([_, value]) => !value);
    if (requiredFields.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const issueData = {
        ...formData,
        studentId: user.studentNumber,
        studentName: `${user.firstName} ${user.lastName}`,
        status: "submitted",
        dateReported: new Date().toISOString()
      };

      await createIssue(issueData);
      
      setSuccess("Issue submitted successfully!");
      setFormData({
        title: "",
        description: "",
        college: "",
        program: "",
        yearOfStudy: "",
        semester: "",
        courseUnit: "",
        courseCode: ""
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Issue submission error:", err);
      setError(err.response?.data?.message || "Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-reporting">
      <h2>Report an Academic Issue</h2>
      
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Issue Title*"
            value={formData.title}
            onChange={handleChange}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <textarea
            name="description"
            placeholder="Detailed Description*"
            value={formData.description}
            onChange={handleChange}
            rows={5}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
            >
              <option value="">Select College*</option>
              {colleges.map(college => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              name="program"
              placeholder="Program Name*"
              value={formData.program}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
            >
              <option value="">Year of Study*</option>
              {[1, 2, 3, 4].map(year => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
            >
              <option value="">Select Semester*</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="courseUnit"
              placeholder="Course Unit Name*"
              value={formData.courseUnit}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="courseCode"
              placeholder="Course Code*"
              value={formData.courseCode}
              onChange={handleChange}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={isSubmitting ? "submitting" : ""}
        >
          {isSubmitting ? "Submitting..." : "Submit Issue"}
        </button>
      </form>
    </div>
  );
};

export default IssueReporting;