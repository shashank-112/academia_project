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

  // ID mappings for filters
  const yearToId = {
    '1st Year': '1',
    '2nd Year': '2',
    '3rd Year': '3',
    '4th Year': '4'
  };
  
  const branchToId = {
    'CSE': '1',
    'ECE': '2',
    'Mechanical': '3',
    'Civil': '4'
  };
  
  const sectionToId = {
    'A': '1',
    'B': '2',
    'C': '3'
  };

  useEffect(() => {
    loadStudents();
  }, [filters]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build filters object - only include non-empty values
      const apiFilters = {};
      if (filters.year) {
        const yearId = yearToId[filters.year];
        if (yearId) apiFilters.year = yearId;
        console.log('Filter: year', filters.year, '-> ID:', yearId);
      }
      if (filters.branch) {
        const branchId = branchToId[filters.branch];
        if (branchId) apiFilters.branch = branchId;
        console.log('Filter: branch', filters.branch, '-> ID:', branchId);
      }
      if (filters.section) {
        const sectionId = sectionToId[filters.section];
        if (sectionId) apiFilters.section = sectionId;
        console.log('Filter: section', filters.section, '-> ID:', sectionId);
      }
      
      console.log('Making API call with filters:', apiFilters);
      const data = await managementService.getAllStudents(apiFilters);
      
      // Check if data is valid
      if (!data) {
        console.error('API returned null or undefined');
        setStudents([]);
        setSelectedStudent(null);
        setLoading(false);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.error('API returned non-array response:', typeof data);
        setStudents([]);
        setSelectedStudent(null);
        setLoading(false);
        return;
      }
      
      console.log('API returned', data.length, 'students');
      setStudents(data);
      setSelectedStudent(data.length > 0 ? data[0] : null);
      setLoading(false);
      
    } catch (err) {
      console.error('ERROR LOADING STUDENTS');
      console.error('Exception:', err);
      if (err.response) {
        console.error('HTTP Status:', err.response.status);
        console.error('Error Data:', err.response.data);
      }
      if (err.request) {
        console.error('No response received from server');
      }
      if (err.message) {
        console.error('Error Message:', err.message);
      }
      
      // Extract error message from response
      let errorMsg = 'Failed to load students';
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error;
      } else if (err.response && err.response.status === 404) {
        errorMsg = 'Employee record not found. Please contact administrator.';
      } else if (err.response && err.response.status === 500) {
        errorMsg = 'Server error while loading students. Check backend logs.';
      }
      
      // IMPORTANT: Still try loading demo data even if error
      setError(`${errorMsg} - using demo data`);
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

  // Use the data as-is from the API (already filtered by backend)
  const displayedStudents = students;

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
          {displayedStudents.map((student) => (
            <div
              key={student.id}
              className="mgmt-student-row"
              onClick={() => setSelectedStudent(student)}
              style={{opacity: selectedStudent?.id === student.id ? 1 : 0.7}}
            >
              <div className="mgmt-student-name">{student.name}</div>
              <div className="mgmt-student-roll">{student.roll_no}</div>
              <div className="mgmt-student-info">{student.branch} / {student.year}</div>
              <div className="mgmt-student-info">{student.phone}</div>
              <div>
                <span className="mgmt-fee-status pending">
                  ⏳ View Details
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
                <div className="mgmt-detail-label">Roll No</div>
                <div className="mgmt-detail-value">{selectedStudent.roll_no}</div>
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
              <p style={{color: '#999', fontSize: '0.9rem'}}>Fee details available in the Fees tab</p>
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
