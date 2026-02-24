import React, { useState, useEffect, useMemo } from 'react';
import { facultyService } from '../../../services/api';
import { notificationService } from '../../../services/api';
import '../styles/Common.css';
import '../styles/Students.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    section: 'all',
  });
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [notificationInput, setNotificationInput] = useState({
    title: '',
    due_date: '',
    description: '',
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [sendError, setSendError] = useState(null);

  // Year ID to display mapping
  const yearNames = {
    '1': '1st Year',
    '2': '2nd Year', 
    '3': '3rd Year',
    '4': '4th Year'
  };

  // Map branch codes used in UI/DB to internal numeric IDs (as strings)
  const branchMap = {
    'CSE': '1', 'ECE': '2', 'CSM': '3', 'CSD': '4',
    'EEE': '5', 'CE': '6', 'ME': '7'
  };

  const branchNames = {
    '1': 'CSE',
    '2': 'ECE',
    '3': 'CSM',
    '4': 'CSD',
    '5': 'EEE',
    '6': 'CV',
    '7': 'ME'
  };

  const sectionNames = {
    '1': 'A',
    '2': 'B',
    '3': 'C'
  };

  // Define available sections per branch (branch IDs as strings)
  const branchSections = {
    '1': ['1', '2', '3'], // CSE has 3 sections
    '2': ['1', '2'], // ECE has 2
    '3': ['1', '2'], // CSM has 2
    '4': ['1'], // CSD
    '5': ['1'], // EEE
    '6': ['1'], // CE
    '7': ['1']  // ME
  };

  const getSectionOptions = (branchValue) => {
    // Always keep an "All Sections" option
    const base = [{ value: 'all', label: 'All Sections' }];
    if (!branchValue || branchValue === 'all') {
      // show all three sections when no branch selected
      return base.concat(
        Object.keys(sectionNames).map(k => ({ value: k, label: `Section ${sectionNames[k]}` }))
      );
    }

    const allowed = branchSections[branchValue] || ['1'];
    return base.concat(allowed.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
  };

  // Compute available filter options based on the students the faculty is teaching.
  // We make them dependent on the other filter values so any selectable
  // combination will yield results (avoids selecting options that produce
  // "No students found").
  const availableOptions = useMemo(() => {
    // Helper to test matches with optional override values
    const matches = (s, { year = filters.year, branch = filters.branch, section = filters.section } = {}) => {
      if (year !== 'all' && year !== undefined && s.year_id?.toString() !== year) return false;
      if (branch !== 'all' && branch !== undefined && s.branch_id?.toString() !== branch) return false;
      if (section !== 'all' && section !== undefined && s.section_id?.toString() !== section) return false;
      return true;
    };

    // Years available given current branch and section selections
    const yearsSet = new Set(
      students
        .filter(s => matches(s, { branch: filters.branch, section: filters.section }))
        .map(s => s.year_id?.toString())
        .filter(Boolean)
    );

    // Branches available given current year and section selections
    const branchesSet = new Set(
      students
        .filter(s => matches(s, { year: filters.year, section: filters.section }))
        .map(s => s.branch_id?.toString())
        .filter(Boolean)
    );

    // Sections available per branch given current year selection
    const sectionsPerBranch = {};
    students.forEach(s => {
      const b = s.branch_id?.toString();
      const sec = s.section_id?.toString() || '1';
      if (!b) return;
      if (filters.year !== 'all' && s.year_id?.toString() !== filters.year) return;
      sectionsPerBranch[b] = sectionsPerBranch[b] || new Set();
      sectionsPerBranch[b].add(sec);
    });

    return {
      years: Array.from(yearsSet).sort((a, b) => Number(a) - Number(b)),
      branches: Array.from(branchesSet).sort((a, b) => Number(a) - Number(b)),
      sections: Object.fromEntries(
        Object.entries(sectionsPerBranch).map(([k, v]) => [k, Array.from(v).sort((a, b) => Number(a) - Number(b))])
      ),
    };
  }, [students, filters.year, filters.branch, filters.section]);

  // Build section options dynamically using availableOptions (falls back to default when needed)
  const getDynamicSectionOptions = (branchValue) => {
    const base = [{ value: 'all', label: 'All Sections' }];
    if (!branchValue || branchValue === 'all') {
      // combine all available sections across branches
      const combined = new Set();
      Object.values(availableOptions.sections || {}).forEach(arr => arr.forEach(x => combined.add(x)));
      const list = Array.from(combined).sort((a, b) => Number(a) - Number(b));
      if (list.length === 0) {
        // fallback to default behavior
        return base.concat(Object.keys(sectionNames).map(k => ({ value: k, label: `Section ${sectionNames[k]}` })));
      }
      return base.concat(list.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
    }

    const allowed = (availableOptions.sections && availableOptions.sections[branchValue]) || [];
    if (allowed.length === 0) {
      // no available sections for this branch (fallback to branchSections if defined)
      const fall = branchSections[branchValue] || ['1'];
      return base.concat(fall.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
    }
    return base.concat(allowed.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
  };

  // If an option becomes invalid due to students changing, reset it to 'all'
  useEffect(() => {
    // Branch
    if (filters.branch !== 'all' && !availableOptions.branches.includes(filters.branch)) {
      setFilters(prev => ({ ...prev, branch: 'all' }));
    }
    // Year
    if (filters.year !== 'all' && !availableOptions.years.includes(filters.year)) {
      setFilters(prev => ({ ...prev, year: 'all' }));
    }
    // Section for selected branch
    const secsForBranch = availableOptions.sections[filters.branch] || [];
    if (filters.section !== 'all' && !secsForBranch.includes(filters.section)) {
      setFilters(prev => ({ ...prev, section: 'all' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOptions.years.join(','), availableOptions.branches.join(','), JSON.stringify(availableOptions.sections)]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  // When branch changes, ensure section filter is valid for that branch
  useEffect(() => {
    const branch = filters.branch;
    if (!branch || branch === 'all') return;
    const allowed = branchSections[branch] || ['1'];
    if (filters.section !== 'all' && !allowed.includes(filters.section)) {
      setFilters(prev => ({ ...prev, section: 'all' }));
    }
  }, [filters.branch]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await facultyService.getStudents();
      
      if (Array.isArray(data)) {
        // Normalize branch_id when backend may return codes (e.g., 'CSE')
        const normalized = data.map(s => {
          let branchId = s.branch_id;
          if (typeof branchId === 'string') {
            const up = branchId.toUpperCase();
            if (branchMap[up]) {
              branchId = Number(branchMap[up]);
            } else if (!isNaN(Number(branchId))) {
              branchId = Number(branchId);
            }
          } else if (!branchId && s.branch && typeof s.branch === 'string') {
            const up = s.branch.toUpperCase();
            if (branchMap[up]) branchId = Number(branchMap[up]);
          }
          return { ...s, branch_id: branchId };
        });

        setStudents(normalized);
        setSelectedStudent(null);
      } else {
        setStudents([]);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      let errorMsg = 'Failed to load students';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setError(`${errorMsg} - using demo data`);
      
      // Demo data fallback
      const demoStudents = [
        { id: 1, name: 'Aditya Kumar', email: '1ycsea1@college.edu', roll_no: '4YCS001', year_id: 4, branch_id: 1, section_id: 1, phone_no: '9876543210', cgpa: 8.5, backlogs: 0 },
        { id: 2, name: 'Priya Singh', email: '1ycsea2@college.edu', roll_no: '4YCS002', year_id: 4, branch_id: 1, section_id: 1, phone_no: '9876543211', cgpa: 7.8, backlogs: 1 },
        { id: 3, name: 'Rajesh Patel', email: '1ycsea3@college.edu', roll_no: '4YCS003', year_id: 4, branch_id: 1, section_id: 2, phone_no: '9876543212', cgpa: 8.2, backlogs: 0 },
        { id: 4, name: 'Sneha Gupta', email: '1ycsea4@college.edu', roll_no: '4YCS004', year_id: 4, branch_id: 1, section_id: 2, phone_no: '9876543213', cgpa: 9.1, backlogs: 0 },
        { id: 5, name: 'Vikram Nair', email: '1ycsea5@college.edu', roll_no: '4YCS005', year_id: 4, branch_id: 1, section_id: 1, phone_no: '9876543214', cgpa: 7.4, backlogs: 2 },
      ];
      setStudents(demoStudents);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    // Apply year filter
    if (filters.year !== 'all') {
      filtered = filtered.filter(s => s.year_id.toString() === filters.year);
    }

    // Apply branch filter
    if (filters.branch !== 'all') {
      filtered = filtered.filter(s => s.branch_id.toString() === filters.branch);
    }

    // Apply section filter
    if (filters.section !== 'all') {
      filtered = filtered.filter(s => s.section_id.toString() === filters.section);
    }



    setFilteredStudents(filtered);
    if (filtered.length > 0 && !filtered.includes(selectedStudent)) {
      setSelectedStudent(filtered[0]);
    }
  };

  return (
    <div className="faculty-students-container">
      {error && <div className="error-banner">{error}</div>}

      {/* HEADER */}
      <div className="page-header">
        <h1>👥 Student Management</h1>
        <p className="page-subtitle">View and manage students from your courses</p>
      </div>

      {/* SEND MESSAGE MODAL */}
      {showModal && (
        <div className="send-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="send-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-icon">📧</span>
              <h2>Send Academic Notification</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-input-group">
                <label>Title</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Enter notification title"
                  value={notificationInput.title}
                  onChange={e => setNotificationInput({ ...notificationInput, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="modal-input-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="modal-input"
                  value={notificationInput.due_date}
                  onChange={e => setNotificationInput({ ...notificationInput, due_date: e.target.value })}
                />
              </div>
              <div className="modal-input-group">
                <label>Description</label>
                <textarea
                  className="modal-input modal-textarea"
                  placeholder="Enter description"
                  value={notificationInput.description}
                  onChange={e => setNotificationInput({ ...notificationInput, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="modal-info-row">
                <span className="modal-info-badge">Type: Academic</span>
                <span className="modal-info-badge">Priority: High</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-info-badge">Year: {selectedStudent?.year_id}</span>
                <span className="modal-info-badge">Branch: {branchNames[selectedStudent?.branch_id?.toString()]}</span>
                <span className="modal-info-badge">Section: {sectionNames[selectedStudent?.section_id?.toString()]}</span>
                <span className="modal-info-badge">Student ID: {selectedStudent?.id}</span>
              </div>
              {sendError && (
                <div style={{ color: '#ffb74d', marginTop: '0.7rem', fontWeight: 600, textAlign: 'center' }}>
                  {sendError}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="modal-send-btn"
                disabled={sending || !notificationInput.title || !notificationInput.due_date || !notificationInput.description}
                onClick={async () => {
                  setSending(true);
                  setSendError(null);
                  try {
                    // Backend expects targets array
                    const targets = [
                      {
                        year_id: selectedStudent?.year_id,
                        branch_id: selectedStudent?.branch_id,
                        section_id: selectedStudent?.section_id,
                        student_id: selectedStudent?.id,
                      }
                    ];
                    const payload = {
                      title: notificationInput.title,
                      description: notificationInput.description,
                      type: 'Academic',
                      priority: 'High',
                      dueDate: notificationInput.due_date,
                      targets,
                    };
                    await notificationService.createNotification(payload);

                    // Send email notification
                    await fetch('http://localhost:8000/api/send-email/', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        to: 'yuvashashank56@gmail.com',
                        subject: notificationInput.title,
                        message: notificationInput.description,
                      }),
                    });

                    setSendSuccess(true);
                    setSending(false);
                    setTimeout(() => {
                      setShowModal(false);
                      setSendSuccess(null);
                      setNotificationInput({ title: '', due_date: '', description: '' });
                    }, 1200);
                  } catch (err) {
                    setSendError('Failed to send notification.');
                    setSending(false);
                  }
                }}
              >
                {sending ? 'Sending...' : sendSuccess ? 'Sent!' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="students-wrapper">
        {/* LEFT PANEL - STUDENTS LIST */}
        <section className="students-list-panel">
          {/* FILTERS */}
          <section style={{ marginBottom: "5px" }} className="filters-section">
            <div className="filter-group">
              <label>Year</label>
              <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}>
                <option value="all">All Years</option>
                {(availableOptions.years || []).map(y => (
                  <option key={y} value={y}>{yearNames[y] || `${y}th Year`}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Branch</label>
              <select value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
                <option value="all">All Branches</option>
                {(availableOptions.branches || []).map(b => (
                  <option key={b} value={b}>{branchNames[b] || `Branch ${b}`}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "19.6px" }} className="filter-group">
              <label>Section</label>
              <select value={filters.section} onChange={(e) => setFilters({...filters, section: e.target.value})}>
                {getDynamicSectionOptions(filters.branch).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </section>

          {/* STUDENTS TABLE */}
          <div className="students-table-wrapper">
            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h2>No students found</h2>
                <p>Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="students-table">
                <div className="table-header">
                  <div className="col-name">Name</div>
                  <div className="col-roll">Roll No</div>
                  <div className="col-cgpa">CGPA</div>
                  <div className="col-backlogs">Backlogs</div>
                </div>
                <div className="table-body">
                  {filteredStudents.map((student, idx) => (
                    <div
                      key={student.id}
                      className={`table-row ${selectedStudent?.id === student.id ? 'active' : ''}`}
                      onClick={() => setSelectedStudent(student)}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="col-name">
                        <div className="student-avatar">{student.name?.charAt(0) || ''}</div>
                        <div className="student-info">
                          <div className="student-name">{student.name}</div>
                          <div className="student-email">{student.email}</div>
                        </div>
                      </div>
                      <div className="col-roll">{student.roll_no}</div>
                      <div className="col-cgpa">
                        <span className={`cgpa-badge cgpa-${student.cgpa >= 8 ? 'high' : student.cgpa >= 7 ? 'medium' : 'low'}`}>
                          {student.cgpa}
                        </span>
                      </div>
                      <div className="col-backlogs">
                        {student.backlogs === 0 ? (
                          <span className="backlog-badge clear">✓ Clear</span>
                        ) : (
                          <span className="backlog-badge pending">{student.backlogs}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL - STUDENT DETAILS */}
        {selectedStudent && (
          <section className="student-details-panel">
            {/* DETAIL HEADER */}
            <div className="detail-header">
              <div className="detail-avatar-large">{selectedStudent.name?.charAt(0) || ''}</div>
              <h2>{selectedStudent.name}</h2>
              <p className="detail-subtitle">{yearNames[selectedStudent.year_id?.toString()]} • {branchNames[selectedStudent.branch_id?.toString()]} • Section {sectionNames[selectedStudent.section_id?.toString()]}</p>
            </div>

            {/* CONTACT INFO */}
            <div className="detail-section">
              <h3 className="section-title">📞 Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{selectedStudent.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{selectedStudent.phone_no}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Roll Number</span>
                  <span className="info-value">{selectedStudent.roll_no}</span>
                </div>
              </div>
            </div>

            {/* ACADEMIC STATS */}
            <div className="detail-section">
              <h3 className="section-title">📊 Academic Performance</h3>
              <div className="stats-grid-detail">
                <div className="stat-box">
                  <span className="stat-icon">🎓</span>
                  <span className="stat-label" style={{ color: 'white' }}>CGPA</span>
                  <span className={`stat-value cgpa-${selectedStudent.cgpa >= 8 ? 'high' : selectedStudent.cgpa >= 7 ? 'medium' : 'low'}`}>{selectedStudent.cgpa}</span>
                  <span className="stat-unit" style={{ color: 'white' }}>out of 10</span>
                </div>
                <div className="stat-box">
                  <span className="stat-icon">📚</span>
                  <span className="stat-label" style={{ color: 'white' }}>Backlogs</span>
                  <span className={`stat-value ${selectedStudent.backlogs === 0 ? 'success' : 'warning'}`}>{selectedStudent.backlogs}</span>
                  <span className="stat-unit" style={{ color: 'white' }}>pending courses</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="detail-section">
              <h3 className="section-title">⚡ Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary" onClick={() => setShowModal(true)}>
                  <span>📧</span> Send Message
                </button>
                <button className="action-btn secondary">
                  <span>📋</span> View Records
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Students;
