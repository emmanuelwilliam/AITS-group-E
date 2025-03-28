import React, { useState } from "react";
import "../styles/issueReporting.css";

const IssueReporting = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [semester, setSemester] = useState("");
  const [courseUnit, setCourseUnit] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !description || !college || !program || !yearOfStudy || !semester || !courseUnit || !courseCode) {
      setError("Please fill in all fields.");
      return;
    }

    // Simulate submitting the issue
    alert(`Issue Submitted: ${title}`);
    setTitle("");
    setDescription("");
    setCollege("");
    setProgram("");
    setYearOfStudy("");
    setSemester("");
    setCourseUnit("");
    setCourseCode("");
    setError("");
  };

  return (
    <div className="issue-reporting">
      <h2>Report an Academic Issue</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <select
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          required
        >
          <option value="">Select College</option>
          {colleges.map((college) => (
            <option key={college} value={college}>
              {college}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Program"
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          required
        />
        <select
          value={yearOfStudy}
          onChange={(e) => setYearOfStudy(e.target.value)}
          required
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
          required
        >
          <option value="">Select Semester</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
        <input
          type="text"
          placeholder="Course Unit"
          value={courseUnit}
          onChange={(e) => setCourseUnit(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit Issue</button>
      </form>
    </div>
  );
};

export default IssueReporting;