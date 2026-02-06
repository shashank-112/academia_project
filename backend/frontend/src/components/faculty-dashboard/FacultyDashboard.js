import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { facultyService } from '../../services/api';
import '../Dashboard.css';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setAssignments(assignmentsData);
    } catch (err) {
      setError('Failed to load faculty data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>👨‍🏫 Faculty Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {error && <div className="error-alert">{error}</div>}

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2>Profile Information</h2>
          {profile && (
            <div className="info-grid">
              <div className="info-item">
                <label>Faculty ID</label>
                <p>{profile.faculty_id}</p>
              </div>
              <div className="info-item">
                <label>Name</label>
                <p>{profile.first_name} {profile.last_name}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
              <div className="info-item">
                <label>Department</label>
                <p>{profile.department}</p>
              </div>
              <div className="info-item">
                <label>Designation</label>
                <p>{profile.designation}</p>
              </div>
              <div className="info-item">
                <label>Qualifications</label>
                <p>{profile.qualifications}</p>
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Course Assignments</h2>
          {assignments && assignments.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Branch</th>
                    <th>Section</th>
                    <th>Course ID</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment, idx) => (
                    <tr key={idx}>
                      <td>{assignment.year_id}</td>
                      <td>{assignment.branch_id}</td>
                      <td>{assignment.section_id}</td>
                      <td>{assignment.course_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No course assignments found</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default FacultyDashboard;
