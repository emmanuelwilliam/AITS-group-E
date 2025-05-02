import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import { createIssue } from '../api/issueService';
import '../styles/issueReporting.css';

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
    priority: "Medium",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
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
      priority: "Medium",
    });
    setErrors({});
    setSuccessMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    ['title', 'description', 'college', 'program', 'course_unit', 'course_code'].forEach(field => {
      if (!formData[field]) newErrors[field] = 'This field is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    try {
      const payload = {
        ...formData,
        year_of_study: formData.year_of_study,
        semester: formData.semester,
      };
  
      console.log('Submitting:', payload);
      const response = await createIssue(payload);
      
      setSuccessMessage('Issue submitted successfully!');
      window.alert('Issue submitted successfully!'); // Display alert at the top
      resetForm();
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({
        form: err.response?.data?.error || 
             'Submission failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-reporting">
      <h2>Report an Academic Issue</h2>
      {errors.form && <div className="alert error">{errors.form}</div>}
      {successMessage && <div className="alert success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label>Issue Title*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={100}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Detailed Description*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            maxLength={1000}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
          <div className="character-count">{formData.description.length}/1000</div>
        </div>

        {/* College & Program */}
        <div className="form-row">
          <div className="form-group">
            <label>College*</label>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              className={errors.college ? 'error' : ''}
            >
              <option value="">Select College</option>
              {colleges.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            {errors.college && <span className="field-error">{errors.college}</span>}
          </div>

          <div className="form-group">
            <label>Program*</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              className={errors.program ? 'error' : ''}
            />
            {errors.program && <span className="field-error">{errors.program}</span>}
          </div>
        </div>

        {/* Year & Semester */}
        <div className="form-row">
          <div className="form-group">
            <label>Year of Study*</label>
            <select
              name="year_of_study"
              value={formData.year_of_study}
              onChange={handleChange}
            >
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Semester*</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
            >
              <option value="1">First Semester</option>
              <option value="2">Second Semester</option>
            </select>
          </div>
        </div>

        {/* Course & Code */}
        <div className="form-row">
          <div className="form-group">
            <label>Course Unit*</label>
            <input
              type="text"
              name="course_unit"
              value={formData.course_unit}
              onChange={handleChange}
              className={errors.course_unit ? 'error' : ''}
            />
            {errors.course_unit && <span className="field-error">{errors.course_unit}</span>}
          </div>

          <div className="form-group">
            <label>Course Code*</label>
            <input
              type="text"
              name="course_code"
              value={formData.course_code}
              onChange={handleChange}
              className={errors.course_code ? 'error' : ''}
            />
            {errors.course_code && <span className="field-error">{errors.course_code}</span>}
          </div>
        </div>

        {/* Category & Priority */}
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {['Academic', 'Discipline', 'Financial', 'Other'].map(c => (
                <option key={c} value={c}>{c}</option>
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
              {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting…' : 'Submit Issue'}
        </button>
      </form>
    </div>
  );
};

export default IssueReporting;
