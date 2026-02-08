import React, { useState, useEffect } from 'react';
import { facultyService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Courses.css';

const Courses = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Branch ID to name mapping
  const branchNames = {
    '1': 'CSE',
    '2': 'ECE',
    '3': 'CSM',
    '4': 'CSD',
    '5': 'EEE',
    '6': 'CV',
    '7': 'ME'
  };

  // Section ID to letter mapping
  const sectionNames = {
    '1': 'A',
    '2': 'B',
    '3': 'C'
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await facultyService.getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-courses">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>📚 Courses</h1>
        <p className="page-subtitle">View all courses assigned to you</p>
      </div>

      {assignments.length > 0 ? (
        <div className="courses-grid">
          {assignments.map((assignment, idx) => (
            <div key={idx} className="course-card">
              <div className="course-header">
                <span className="course-code">{assignment.course_id}</span>
                <span className="course-badge">{assignment.year_id}</span>
              </div>
              <div className="course-details">
                <div className="detail-item">
                  <span className="label">Branch</span>
                  <span className="value">{branchNames[assignment.branch_id.toString()] || assignment.branch_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Section</span>
                  <span className="value">Section - {sectionNames[assignment.section_id.toString()] || assignment.section_id}</span>
                </div>
              </div>
              <button className="course-action-btn">Manage Course</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h2>No Courses Assigned</h2>
          <p>You don't have any course assignments yet</p>
        </div>
      )}
    </div>
  );
};

export default Courses;
