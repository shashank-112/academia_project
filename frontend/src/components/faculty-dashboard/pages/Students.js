import React, { useState } from 'react';
import '../styles/Common.css';
import '../styles/Students.css';

const Students = () => {
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    section: 'all',
  });

  return (
    <div className="faculty-students">
      <div className="page-header">
        <h1>👥 Students</h1>
        <p className="page-subtitle">Manage students per course and section</p>
      </div>

      {/* FILTERS */}
      <section className="filters-section">
        <div className="filter-group">
          <label>Year</label>
          <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}>
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Branch</label>
          <select value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
            <option value="all">All Branches</option>
            <option value="CSE">Computer Science</option>
            <option value="ECE">Electronics</option>
            <option value="MECH">Mechanical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Section</label>
          <select value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>
            <option value="all">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </section>

      {/* STUDENTS TABLE */}
      <section className="students-section">
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h2>Students list</h2>
          <p>Select filters to view students</p>
        </div>
      </section>
    </div>
  );
};

export default Students;
