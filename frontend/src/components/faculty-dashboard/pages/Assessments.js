import React, { useState } from 'react';
import '../styles/Common.css';
import '../styles/Assessments.css';

const Assessments = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  return (
    <div className="faculty-assessments">
      <div className="page-header">
        <h1>📊 Assessments</h1>
        <p className="page-subtitle">Enter and view academic evaluations</p>
      </div>

      {/* SELECTION SECTION */}
      <section className="selection-section">
        <div className="selection-group">
          <label>Select Course</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Choose a course...</option>
            <option value="CS101">CS101 - Data Structures</option>
            <option value="CS102">CS102 - Algorithms</option>
          </select>
        </div>

        <div className="selection-group">
          <label>Select Section</label>
          <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <option value="">Choose a section...</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </section>

      {/* MARKS ENTRY SECTION */}
      <section className="marks-section">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h2>Assessment Entry</h2>
          <p>Select a course and section to enter marks</p>
        </div>
      </section>
    </div>
  );
};

export default Assessments;
