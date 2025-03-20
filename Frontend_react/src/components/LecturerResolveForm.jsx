import React, { useState } from "react";

const LecturerResolveForm = ({ issue, onResolve }) => {
  const [resolution, setResolution] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onResolve(resolution);
  };

  return (
    <div className="resolve-form">
      <h2>Resolve Issue: {issue.title}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Enter resolution..."
          required
        />
        <button type="submit">Submit Resolution</button>
      </form>
    </div>
  );
};

export default LecturerResolveForm;