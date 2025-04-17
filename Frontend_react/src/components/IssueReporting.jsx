import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { createIssue } from "../api/issueService";
import "../styles/issueReporting.css";

const IssueReporting = ({ onIssueCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    college: "",
    program: "",
    year_of_study: "1",
    semester: "1",
    course_unit: "",
    course_code: "",
    category: "Academic",
    priority: "Medium"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const categories = ["Academic", "Discipline", "Financial", "Other"];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'title', 'description', 'college', 'program', 
      'year_of_study', 'semester', 'course_unit', 'course_code'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      
      const issueData = {
        ...formData,
        student: user.id,  // Using the user's ID from auth context
        status: "submitted"  // Default status
      };

      const createdIssue = await createIssue(issueData);
      
      // Notify parent component about the new issue
      if (onIssueCreated) {
        onIssueCreated(createdIssue);
      }

      setSubmitSuccess(true);
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        college: "",
        program: "",
        year_of_study: "1",
        semester: "1",
        course_unit: "",
        course_code: "",
        category: "Academic",
        priority: "Medium"
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Issue submission error:", err);
      
      // Handle backend validation errors
      if (err.response?.data) {
        const backendErrors = err.response.data;
        const fieldErrors = {};
        
        // Map backend errors to form fields
        for (const key in backendErrors) {
          if (key in formData) {
            fieldErrors[key] = Array.isArray(backendErrors[key]) 
              ? backendErrors[key].join(' ') 
              : backendErrors[key];
          }
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ form: "Failed to submit issue. Please try again." });
        }
      } else {
        setErrors({ form: err.message || "Failed to submit issue. Please try again." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-reporting">
      <h2>Report an Academic Issue</h2>
      
      {errors.form && <div className="alert error">{errors.form}</div>}
      {submitSuccess && (
        <div className="alert success">
          Issue submitted successfully! It will now be reviewed.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Issue Title*</label>
          <input
            type="text"
            name="title"
            placeholder="Briefly describe your issue"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? "error" : ""}
            maxLength={100}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Detailed Description*</label>
          <textarea
            name="description"
            placeholder="Provide all relevant details about your issue"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
            rows={5}
            maxLength={1000}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
          <div className="character-count">
            {formData.description.length}/1000 characters
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>College*</label>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              className={errors.college ? "error" : ""}
            >
              <option value="">Select your college</option>
              {colleges.map(college => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
            {errors.college && <span className="field-error">{errors.college}</span>}
          </div>

          <div className="form-group">
            <label>Program*</label>
            <input
              type="text"
              name="program"
              placeholder="Your program of study"
              value={formData.program}
              onChange={handleChange}
              className={errors.program ? "error" : ""}
            />
            {errors.program && <span className="field-error">{errors.program}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Year of Study*</label>
            <select
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
              className={errors.year_of_study ? "error" : ""}
            >
              <option value="">Select year</option>
              {[1, 2, 3, 4].map(year => (
                <option key={year} value={year.toString()}>
                  Year {year}
                </option>
              ))}
            </select>
            {errors.year_of_study && <span className="field-error">{errors.year_of_study}</span>}
          </div>

          <div className="form-group">
            <label>Semester*</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={errors.semester ? "error" : ""}
            >
              <option value="">Select semester</option>
              <option value="1">First Semester</option>
              <option value="2">Second Semester</option>
            </select>
            {errors.semester && <span className="field-error">{errors.semester}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Course Unit*</label>
            <input
              type="text"
              name="course_unit"
              placeholder="Course unit name"
              value={formData.course_unit}
              onChange={handleChange}
              className={errors.course_unit ? "error" : ""}
            />
            {errors.course_unit && <span className="field-error">{errors.course_unit}</span>}
          </div>

          <div className="form-group">
            <label>Course Code*</label>
            <input
              type="text"
              name="course_code"
              placeholder="Course code (e.g. CSC 101)"
              value={formData.course_code}
              onChange={handleChange}
              className={errors.course_code ? "error" : ""}
            />
            {errors.course_code && <span className="field-error">{errors.course_code}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span> Submitting...
            </>
          ) : (
            "Submit Issue"
          )}
        </button>
      </form>
    </div>
  );
};

export default IssueReporting;
