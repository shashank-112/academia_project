import React, { useState, useEffect } from 'react';
import { managementService } from '../../../services/api';
import '../styles/Students.css';
import '../styles/Common.css';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    branch: '',
    section: ''
  });

  const [branches, setBranches] = useState(['CSE', 'ECE', 'Mechanical', 'Civil']);
  const [sections, setSections] = useState(['A', 'B', 'C']);
  const [years, setYears] = useState(['1st Year', '2nd Year', '3rd Year', '4th Year']);

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await managementService.getAllStudents(filters);
      setStudents(data || []);
      if (data && data.length > 0) {
        setSelectedStudent(data[0]);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
      // Demo data
      setStudents([
        {
          id: 1,
          name: 'John Doe',
          rollNo: '4YCS001',
          branch: 'CSE',
          year: '4th Year',
          section: 'A',
          phone: '9876543210',
          email: 'john@college.edu',
          feeStatus: 'Paid',
          totalFee: 100000,
          paidAmount: 100000,
          remainingAmount: 0,
          libraryFine: 0,
          equipmentFine: 0,
          crtFeeStatus: 'Paid'
        },
        {
          id: 2,
          name: 'Alice Smith',
          rollNo: '4YCS002',
          branch: 'CSE',
          year: '4th Year',
          section: 'A',
          phone: '9876543211',
          email: 'alice@college.edu',
          feeStatus: 'Pending',
          totalFee: 100000,
          paidAmount: 50000,
          remainingAmount: 50000,
          libraryFine: 500,
          equipmentFine: 1000,
          crtFeeStatus: 'Pending'
        },
        {
          id: 3,
          name: 'Bob Johnson',
          rollNo: '4YCS003',
          branch: 'CSE',
          year: '4th Year',
          section: 'B',
          phone: '9876543212',
          email: 'bob@college.edu',
          feeStatus: 'Paid',
          totalFee: 100000,
          paidAmount: 100000,
          remainingAmount: 0,
          libraryFine: 0,
          equipmentFine: 0,
          crtFeeStatus: 'Paid'
        }
      ]);
      setSelectedStudent({
        id: 1,
        name: 'John Doe',
        rollNo: '4YCS001',
        branch: 'CSE',
        year: '4th Year',
        section: 'A',
        phone: '9876543210',
        email: 'john@college.edu',
        feeStatus: 'Paid',
        totalFee: 100000,
        paidAmount: 100000,
        remainingAmount: 0,
        libraryFine: 0,
        equipmentFine: 0,
        crtFeeStatus: 'Paid'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({...filters, [field]: value});
  };

  const filteredStudents = students.filter(student => {
    if (filters.year && student.year !== filters.year) return false;
    if (filters.branch && student.branch !== filters.branch) return false;
    if (filters.section && student.section !== filters.section) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="mgmt-page-loading">
        <div className="mgmt-loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="mgmt-students-container">
      {error && <div className="mgmt-error-banner">{error}</div>}

      <div className="mgmt-page-header">
        <h1>Student Management</h1>
        <p className="mgmt-page-subtitle">View and manage student information and fees</p>
      </div>

      {/* Filters */}
      <div className="mgmt-students-filters">
        <div>
          <label>Year</label>
          <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}>
            <option value="">All Years</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div>
          <label>Branch</label>
          <select value={filters.branch} onChange={(e) => handleFilterChange('branch', e.target.value)}>
            <option value="">All Branches</option>
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>
        </div>
        <div>
          <label>Section</label>
          <select value={filters.section} onChange={(e) => handleFilterChange('section', e.target.value)}>
            <option value="">All Sections</option>
            {sections.map(section => <option key={section} value={section}>Section {section}</option>)}
          </select>
        </div>
      </div>

      {/* Student List and Detail */}
      <div className="mgmt-student-list-wrapper">
        {/* Student List */}
        <div className="mgmt-student-list">
          <div className="mgmt-student-table-header">
            <div>Name</div>
            <div>Roll No</div>
            <div>Branch / Year</div>
            <div>Phone</div>
            <div>Fee Status</div>
          </div>
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="mgmt-student-row"
              onClick={() => setSelectedStudent(student)}
              style={{opacity: selectedStudent?.id === student.id ? 1 : 0.7}}
            >
              <div className="mgmt-student-name">{student.name}</div>
              <div className="mgmt-student-roll">{student.rollNo}</div>
              <div className="mgmt-student-info">{student.branch} / {student.year}</div>
              <div className="mgmt-student-info">{student.phone}</div>
              <div>
                <span className={`mgmt-fee-status ${student.feeStatus.toLowerCase()}`}>
                  {student.feeStatus === 'Paid' ? '✓' : '⏳'} {student.feeStatus}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Student Detail Panel */}
        {selectedStudent ? (
          <div className="mgmt-student-detail-panel">
            <div className="mgmt-detail-header">
              <div className="mgmt-detail-avatar">
                {selectedStudent.name?.charAt(0).toUpperCase()}
              </div>
              <div className="mgmt-detail-header-info">
                <h3>{selectedStudent.name}</h3>
                <p>{selectedStudent.rollNo}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mgmt-detail-section">
              <h4>Personal Information</h4>
              <div className="mgmt-detail-item">
                <div className="mgmt-detail-label">Email</div>
                <div className="mgmt-detail-value">{selectedStudent.email}</div>
              </div>
              <div className="mgmt-detail-item">
                <div className="mgmt-detail-label">Phone</div>
                <div className="mgmt-detail-value">{selectedStudent.phone}</div>
              </div>
              <div className="mgmt-detail-item">
                <div className="mgmt-detail-label">Branch</div>
                <div className="mgmt-detail-value">{selectedStudent.branch}</div>
              </div>
              <div className="mgmt-detail-item">
                <div className="mgmt-detail-label">Year</div>
                <div className="mgmt-detail-value">{selectedStudent.year}</div>
              </div>
              <div className="mgmt-detail-item">
                <div className="mgmt-detail-label">Section</div>
                <div className="mgmt-detail-value">{selectedStudent.section}</div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="mgmt-detail-section">
              <h4>Fee Details</h4>
              <div className="mgmt-fee-breakdown">
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">Total Fee:</span>
                  <span className="mgmt-fee-amount">₹{selectedStudent.totalFee?.toLocaleString()}</span>
                </div>
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">Paid Amount:</span>
                  <span className="mgmt-fee-amount">₹{selectedStudent.paidAmount?.toLocaleString()}</span>
                </div>
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">Remaining:</span>
                  <span className="mgmt-fee-amount">₹{selectedStudent.remainingAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div className="mgmt-fee-breakdown" style={{marginTop: '1rem'}}>
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">Library Fine:</span>
                  <span className="mgmt-fee-amount">₹{selectedStudent.libraryFine}</span>
                </div>
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">Equipment Fine:</span>
                  <span className="mgmt-fee-amount">₹{selectedStudent.equipmentFine}</span>
                </div>
                <div className="mgmt-fee-item">
                  <span className="mgmt-fee-label">CRT Fee:</span>
                  <span className={`mgmt-fee-amount ${selectedStudent.crtFeeStatus?.toLowerCase()}`}>
                    {selectedStudent.crtFeeStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mgmt-student-detail-panel">
            <div className="mgmt-empty-detail">
              <p>Select a student to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
