import React, { useState, useEffect } from 'react';
import { facultyService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Home.css';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Year ID to display mapping
  const yearNames = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  };

  // Branch ID to name mapping
  const branchNames = {
    '1': 'Computer Science',
    '2': 'Electronics',
    '3': 'Mechanical',
    '4': 'Civil',
    '5': 'Electrical',
    '6': 'Civil',
    '7': 'Mechanical'
  };

  // Section ID to letter mapping
  const sectionNames = {
    '1': 'A',
    '2': 'B',
    '3': 'C'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, assignmentsData] = await Promise.all([
        facultyService.getProfile(),
        facultyService.getAssignments(),
      ]);
      setProfile(profileData);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCourses = new Set(assignments?.map(a => a.course_id) || []);
  const courseCount = uniqueCourses.size;

  return (
    <div className="faculty-home">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>👨‍🏫 Dashboard</h1>
        <p className="page-subtitle">Welcome back, {profile?.first_name}! Here's your teaching overview</p>
      </div>

      {/* FACULTY SUMMARY CARDS */}
      <section className="summary-section">
        <div className="summary-grid">
          {/* Personal Info Card */}
          <div className="summary-card">
            <div className="card-icon-badge">👤</div>
            <h3 className="card-title">Personal Information</h3>
            <div className="card-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{profile?.first_name} {profile?.last_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{profile?.department || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Designation:</span>
                <span className="detail-value">{profile?.designation || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Courses Card */}
          <div className="summary-card highlight-purple">
            <div className="card-icon-badge">📚</div>
            <h3 className="card-title">Assigned Courses</h3>
            <div className="card-big-number">{courseCount}</div>
            <p className="card-subtitle">courses to handle</p>
          </div>

          {/* Sections Card */}
          <div className="summary-card highlight-blue">
            <div className="card-icon-badge">👥</div>
            <h3 className="card-title">Assigned Sections</h3>
            <div className="card-big-number">{assignments?.length || 0}</div>
            <p className="card-subtitle">year/branch/section combinations</p>
          </div>

          {/* Pending Work Card */}
          <div className="summary-card highlight-orange">
            <div className="card-icon-badge">📊</div>
            <h3 className="card-title">Pending Evaluations</h3>
            <div className="card-big-number">–</div>
            <p className="card-subtitle">to be added</p>
          </div>
        </div>
      </section>

      {/* COURSES TABLE */}
      <section className="courses-section">
        <h2 className="section-title">📚 Your Courses</h2>
        {assignments && assignments.length > 0 ? (
          <div className="table-wrapper">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Course ID</th>
                  <th>Year</th>
                  <th>Branch</th>
                  <th>Section</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, idx) => (
                  <tr key={idx}>
                    <td className="course-code">{assignment.course_id || 'N/A'}</td>
                    <td>{yearNames[assignment.year_id.toString()] || assignment.year_id || 'N/A'}</td>
                    <td>{branchNames[assignment.branch_id.toString()] || assignment.branch_id || 'N/A'}</td>
                    <td>Section - {sectionNames[assignment.section_id.toString()] || assignment.section_id || 'N/A'}</td>
                    <td>
                      <button className="action-btn">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No course assignments found</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
