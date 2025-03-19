import React, { useState } from "react";
import "../styles/issueReporting.css";

const IssueReporting = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [semester, setSemester] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !yearOfStudy || !semester || !courseName || !courseCode) {
      setError("Please fill in all fields.");
      return;
    }

    // Simulate submitting the issue
    alert(`Issue Submitted: ${title}`);
    setTitle("");
    setDescription("");
    setYearOfStudy("");
    setSemester("");
    setCourseName("");
    setCourseCode("");
    setError("");
  };

  return (
    <div className="issue-reporting">
      <h2>Report an Issue</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          value={yearOfStudy}
          onChange={(e) => setYearOfStudy(e.target.value)}
        >
          <option value="">Select Year of Study</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">Select Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default IssueReporting;