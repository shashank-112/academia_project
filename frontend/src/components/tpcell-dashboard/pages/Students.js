import React, { useState, useEffect, useMemo } from 'react';
import { tpcellService } from '../../../services/api';
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
    '6': 'CE',
    '7': 'ME'
  };

  const sectionNames = {
    '1': 'A',
    '2': 'B',
    '3': 'C'
  };

  // Define available sections per branch based on TP Cell requirements
  // CSE: 3 sections, ECE: 2, CSM: 2, CSD: 1, EEE: 1, CE: 1, ME: 1
  const branchSections = {
    '1': ['1', '2', '3'], // CSE has 3 sections (A, B, C)
    '2': ['1', '2'],      // ECE has 2 sections (A, B)
    '3': ['1', '2'],      // CSM has 2 sections (A, B)
    '4': ['1'],           // CSD has 1 section (A)
    '5': ['1'],           // EEE has 1 section (A)
    '6': ['1'],           // CE has 1 section (A)
    '7': ['1']            // ME has 1 section (A)
  };

  // Always show all possible years
  const getAllYears = () => {
    return ['1', '2', '3', '4'];
  };

  // Always show all possible branches
  const getAllBranches = () => {
    return ['1', '2', '3', '4', '5', '6', '7'];
  };

  const getSectionOptions = (branchValue) => {
    const base = [{ value: 'all', label: 'All Sections' }];
    if (!branchValue || branchValue === 'all') {
      return base.concat(
        Object.keys(sectionNames).map(k => ({ value: k, label: `Section ${sectionNames[k]}` }))
      );
    }

    const allowed = branchSections[branchValue] || ['1'];
    return base.concat(allowed.map(k => ({ value: k, label: `Section ${sectionNames[k] || k}` })));
  };

  const getDynamicSectionOptions = (branchValue) => {
    return getSectionOptions(branchValue);
  };

  // Reset section filter when branch changes
  useEffect(() => {
    const branch = filters.branch;
    if (!branch || branch === 'all') return;
    const allowed = branchSections[branch] || ['1'];
    if (filters.section !== 'all' && !allowed.includes(filters.section)) {
      setFilters(prev => ({ ...prev, section: 'all' }));
    }
  }, [filters.branch]);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch from API - no fallback, use real data only
      const data = await tpcellService.getAllStudents();
      
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
        console.log(`✓ Loaded ${normalized.length} students from API`);
      } else {
        setStudents([]);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('❌ Error loading students:', err.response?.data || err.message);
      setError(`Failed to load students: ${err.response?.data?.error || err.message}`);
      setStudents([]);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    if (filters.year !== 'all') {
      filtered = filtered.filter(s => s.year_id?.toString() === filters.year);
    }

    if (filters.branch !== 'all') {
      filtered = filtered.filter(s => s.branch_id?.toString() === filters.branch);
    }

    if (filters.section !== 'all') {
      filtered = filtered.filter(s => s.section_id?.toString() === filters.section);
    }

    setFilteredStudents(filtered);
    if (filtered.length > 0 && !filtered.includes(selectedStudent)) {
      setSelectedStudent(filtered[0]);
    }
  };

  return (
    <div className="tpcell-students-container">
      {error && <div className="error-banner">{error}</div>}

      {/* HEADER */}
      <div className="page-header">
        <h1>👥 Student Management</h1>
        <p className="page-subtitle">View and manage students for placement eligibility</p>
      </div>

      <div className="students-wrapper">
        {/* LEFT PANEL - STUDENTS LIST */}
        <section className="students-list-panel">
          {/* FILTERS */}
          <section className="filters-section">
            <div className="filter-group">
              <label>Year</label>
              <select value={filters.year} onChange={(e) => setFilters({...filters, year: e.target.value})}>
                <option value="all">All Years</option>
                {getAllYears().map(y => (
                  <option key={y} value={y}>{yearNames[y] || `${y}th Year`}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Branch</label>
              <select value={filters.branch} onChange={(e) => setFilters({...filters, branch: e.target.value})}>
                <option value="all">All Branches</option>
                {getAllBranches().map(b => (
                  <option key={b} value={b}>{branchNames[b] || `Branch ${b}`}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
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
                <p>Try adjusting your filters</p>
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
                <button className="action-btn primary">
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
