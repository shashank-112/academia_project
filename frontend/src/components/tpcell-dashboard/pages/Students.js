import React, { useState, useEffect } from 'react';
import '../styles/Common.css';
import '../styles/Students.css';

const Students = () => {
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    section: 'all',
  });
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const yearOptions = ['all', '1', '2', '3', '4'];
  const branchOptions = ['all', 'CSE', 'ECE', 'ME', 'CE'];
  const sectionOptions = ['all', 'A', 'B', 'C'];

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      // TODO: Fetch filtered students from API
      // const data = await studentService.getFilteredStudents(filters);
      // setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpcell-students">
      <div className="page-header">
        <h2>👥 Student Management</h2>
        <p>View and manage student details for placement eligibility</p>
      </div>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filter-group">
          <label htmlFor="year-filter">Year</label>
          <select
            id="year-filter"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Years' : `Year ${option}`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="branch-filter">Branch</label>
          <select
            id="branch-filter"
            value={filters.branch}
            onChange={(e) => handleFilterChange('branch', e.target.value)}
          >
            {branchOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Branches' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="section-filter">Section</label>
          <select
            id="section-filter"
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
          >
            {sectionOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All Sections' : `Section ${option}`}
              </option>
            ))}
          </select>
        </div>

        <button className="apply-filters-btn" onClick={handleApplyFilters} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </section>

      {/* Student List */}
      <section className="students-section">
        {students.length > 0 ? (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Attendance %</th>
                  <th>Avg Marks</th>
                  <th>Backlogs</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.roll_no}</td>
                    <td>{student.branch}</td>
                    <td>{student.year}</td>
                    <td>{student.attendance}%</td>
                    <td>{student.avg_marks}</td>
                    <td>
                      <span className={`backlog-badge ${student.has_backlogs ? 'yes' : 'no'}`}>
                        {student.has_backlogs ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedStudent(student)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h2>No Students Found</h2>
            <p>Apply filters to search for students</p>
          </div>
        )}
      </section>

      {/* Student Detail Panel */}
      {selectedStudent && (
        <section className="student-detail-section">
          <div className="detail-header">
            <h3>Student Details</h3>
            <button
              className="close-btn"
              onClick={() => setSelectedStudent(null)}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className="detail-content">
            <div className="detail-group">
              <h4>Personal Information</h4>
              <div className="detail-item">
                <label>Name</label>
                <p>{selectedStudent.name}</p>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <p>{selectedStudent.email}</p>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <p>{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="detail-group">
              <h4>Academic Information</h4>
              <div className="detail-item">
                <label>Roll No</label>
                <p>{selectedStudent.roll_no}</p>
              </div>
              <div className="detail-item">
                <label>Branch</label>
                <p>{selectedStudent.branch}</p>
              </div>
              <div className="detail-item">
                <label>CGPA</label>
                <p>{selectedStudent.cgpa}</p>
              </div>
              <div className="detail-item">
                <label>Attendance</label>
                <p>{selectedStudent.attendance}%</p>
              </div>
            </div>

            <div className="detail-group">
              <h4>Backlogs</h4>
              {selectedStudent.backlogs && selectedStudent.backlogs.length > 0 ? (
                <ul className="backlogs-list">
                  {selectedStudent.backlogs.map((backlog) => (
                    <li key={backlog.id}>{backlog.course_id}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-backlogs">No backlogs</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Students;
