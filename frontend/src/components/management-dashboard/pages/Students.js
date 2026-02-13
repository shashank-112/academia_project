import React, { useState, useEffect, useMemo } from 'react';
import { managementService } from '../../../services/api';
import '../styles/Students.css';
import '../styles/Common.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    section: 'all'
  });

  // Display mappings
  const yearNames = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
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

  // Define available sections per branch
  const branchSections = {
    '1': ['1', '2', '3'], // CSE - 3 sections
    '2': ['1', '2'],      // ECE - 2 sections
    '3': ['1', '2'],      // CSM - 2 sections
    '4': ['1'],           // CSD - 1 section
    '5': ['1'],           // EEE - 1 section
    '6': ['1'],           // CE - 1 section
    '7': ['1']            // ME - 1 section
  };

  // Always show all years
  const getAllYears = () => ['1', '2', '3', '4'];

  // Always show all branches
  const getAllBranches = () => ['1', '2', '3', '4', '5', '6', '7'];

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

  // Reset section when branch changes
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
      
      // Fetch from API - real data only
      const data = await managementService.getAllStudents();
      
      if (Array.isArray(data)) {
        console.log(`✓ Loaded ${data.length} students from API`);
        setStudents(data);
        setSelectedStudent(null);
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
    <div className="mgmt-students-container">
      {error && <div className="error-banner">{error}</div>}

      {/* HEADER */}
      <div className="page-header">
        <h1>💳 Student Fees Management</h1>
        <p className="page-subtitle">View and manage student fee information and payment status</p>
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
                  <div className="col-total">Total Fee</div>
                  <div className="col-status">Status</div>
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
                      <div className="col-total">₹{student.fee_total || 0}</div>
                      <div className="col-status">
                        {student.fee_remaining === 0 ? (
                          <span className="fee-badge clear">✓ Paid</span>
                        ) : (
                          <span className="fee-badge pending">₹{student.fee_remaining}</span>
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
              <h3 className="section-title">📞 Personal Information</h3>
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

            {/* FEE BREAKDOWN */}
            <div className="detail-section">
              <h3 className="section-title">💰 Fee Details</h3>
              <div className="fee-breakdown">
                <div className="fee-item">
                  <span className="fee-label">Total Fee</span>
                  <span className="fee-value">₹{selectedStudent.fee_total || 0}</span>
                </div>
                <div className="fee-item">
                  <span className="fee-label">Paid Amount</span>
                  <span className="fee-value paid">₹{selectedStudent.fee_paid || 0}</span>
                </div>
                <div className="fee-item highlight">
                  <span className="fee-label">Remaining</span>
                  <span className={`fee-value ${selectedStudent.fee_remaining === 0 ? 'paid' : 'pending'}`}>
                    ₹{selectedStudent.fee_remaining || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* FINE DETAILS */}
            <div className="detail-section">
              <h3 className="section-title">⚠️ Additional Charges</h3>
              <div className="fine-breakdown">
                <div className="fine-item">
                  <span className="fine-label">Library Fine</span>
                  <span className="fine-value">₹{selectedStudent.library_fine || 0}</span>
                </div>
                <div className="fine-item">
                  <span className="fine-label">Equipment Fine</span>
                  <span className="fine-value">₹{selectedStudent.equipment_fine || 0}</span>
                </div>
                <div className="fine-item">
                  <span className="fine-label">CRT Fee Status</span>
                  <span className={`fine-value ${selectedStudent.paid_crt_fee ? 'paid' : 'pending'}`}>
                    {selectedStudent.paid_crt_fee ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* PAYMENT STATUS */}
            <div className="detail-section">
              <h3 className="section-title">📊 Payment Status Summary</h3>
              <div className="status-summary">
                <div className={`status-badge ${selectedStudent.fee_remaining === 0 ? 'success' : 'warning'}`}>
                  {selectedStudent.fee_remaining === 0 ? '✓ ALL FEES PAID' : `₹${selectedStudent.fee_remaining} PENDING`}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Students;
