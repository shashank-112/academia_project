import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';
import '../Dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [backlogs, setBacklogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, academicsData, backlogsData] = await Promise.all([
        studentService.getProfile(),
        studentService.getAcademics(),
        studentService.getBacklogs(),
      ]);
      setProfile(profileData);
      setAcademics(academicsData);
      setBacklogs(backlogsData);
    } catch (err) {
      setError('Failed to load student data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>👨‍🎓 Student Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {error && <div className="error-alert">{error}</div>}

      <main className="dashboard-content">
        <section className="dashboard-section">
          <h2>Profile Information</h2>
          {profile && (
            <div className="info-grid">
              <div className="info-item">
                <label>Student ID</label>
                <p>{profile.student_id}</p>
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
                <label>Roll No</label>
                <p>{profile.roll_no}</p>
              </div>
              <div className="info-item">
                <label>Year</label>
                <p>Year {profile.year_id}</p>
              </div>
              <div className="info-item">
                <label>Section</label>
                <p>{profile.section_id}</p>
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Academic Records</h2>
          {academics && academics.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Course</th>
                    <th>Marks</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {academics.map((record, idx) => (
                    <tr key={idx}>
                      <td>{record.semester_id}</td>
                      <td>{record.course_code}</td>
                      <td>{record.marks !== -1 ? record.marks : 'Backlog'}</td>
                      <td>{record.attendance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No academic records found</p>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Backlogs</h2>
          {backlogs && backlogs.length > 0 ? (
            <div className="backlog-list">
              {backlogs.map((backlog, idx) => (
                <div key={idx} className="backlog-item">
                  <span>Sem {backlog.semester_id}: {backlog.course_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="success-message">✓ No backlogs</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
