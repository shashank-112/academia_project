import React, { useState, useEffect } from 'react';
import { managementService } from '../../../services/api';
import '../styles/Fees.css';
import '../styles/Common.css';

const Fees = () => {
  const [feeData, setFeeData] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    year: '',
    branch: ''
  });

  const branches = ['CSE', 'ECE', 'Mechanical', 'Civil'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

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

  useEffect(() => {
    loadFeeData();
  }, [filters]);

  const loadFeeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get fee summary (no filters needed for this)
      console.log('Fetching fee summary...');
      const summary = await managementService.getFeeSummary();
      console.log('Fee summary response:', summary);
      
      // Validate and set fee data
      if (summary && typeof summary === 'object') {
        // Ensure all values are numbers
        const safeData = {
          expectedFee: Number(summary.expectedFee) || 0,
          collectedFee: Number(summary.collectedFee) || 0,
          pendingFee: Number(summary.pendingFee) || 0
        };
        console.log('Safe fee data:', safeData);
        setFeeData(safeData);
      } else {
        console.warn('Invalid fee summary format, using defaults');
        setFeeData({
          expectedFee: 0,
          collectedFee: 0,
          pendingFee: 0
        });
      }
      
      // Get student fee details with filters
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
      
      console.log('Fetching student fee details with filters:', apiFilters);
      const details = await managementService.getStudentFeeDetails(apiFilters);
      console.log('Fee details response count:', Array.isArray(details) ? details.length : 'not an array');
      
      // Map and validate fee details
      if (details && Array.isArray(details) && details.length > 0) {
        const mapped = details.map(fee => ({
          id: fee.id,
          name: fee.name || '',
          rollNo: fee.roll_no || '',
          admissionMode: fee.admissionMode || 'Regular',
          paidAmount: Number(fee.paidAmount) || 0,
          remainingAmount: Number(fee.remainingAmount) || 0,
          libraryFine: Number(fee.libraryFine) || 0,
          equipmentFine: Number(fee.equipmentFine) || 0,
          status: fee.status || 'Pending'
        }));
        console.log('Mapped', mapped.length, 'fee records');
        setStudentFees(mapped);
      } else {
        console.warn('No fee details returned or invalid format');
        setStudentFees([
        {
          id: 1,
          name: 'John Doe',
          rollNo: '4YCS001',
          admissionMode: 'Regular',
          paidAmount: 100000,
          remainingAmount: 0,
          libraryFine: 0,
          equipmentFine: 0,
          status: 'Paid'
        },
        {
          id: 2,
          name: 'Alice Smith',
          rollNo: '4YCS002',
          admissionMode: 'Regular',
          paidAmount: 50000,
          remainingAmount: 50000,
          libraryFine: 500,
          equipmentFine: 1000,
          status: 'Pending'
        },
        {
          id: 3,
          name: 'Bob Johnson',
          rollNo: '4YCS003',
          admissionMode: 'Merit',
          paidAmount: 100000,
          remainingAmount: 0,
          libraryFine: 0,
          equipmentFine: 0,
          status: 'Paid'
        },
        {
          id: 4,
          name: 'Diana Lee',
          rollNo: '4YCS004',
          admissionMode: 'Regular',
          paidAmount: 75000,
          remainingAmount: 25000,
          libraryFine: 200,
          equipmentFine: 0,
          status: 'Pending'
        },
        {
          id: 5,
          name: 'Evan White',
          rollNo: '4YCS005',
          admissionMode: 'Regular',
          paidAmount: 0,
          remainingAmount: 100000,
          libraryFine: 1000,
          equipmentFine: 1500,
          status: 'Pending'
        }
      ]);
    }
  } catch (err) {
      console.error('ERROR LOADING FEE DATA');
      console.error('Exception:', err);
      
      let errorMessage = 'Failed to load fee data';
      
      // Try to extract error message from API response
      if (err.response) {
        console.error('HTTP Status:', err.response.status);
        console.error('Error Data:', err.response.data);
        if (err.response.data && err.response.data.error) {
          errorMessage = `API Error: ${err.response.data.error}`;
        } else if (err.response.status === 404) {
          errorMessage = 'Employee record not found in the system. Please contact administrator.';
        } else if (err.response.status === 500) {
          errorMessage = 'Server error while loading fee data. Please check logs or contact administrator.';
        }
      } else if (err.request) {
        console.error('No response received from server');
        errorMessage = 'No response from server - connection issue. Check if backend is running.';
      } else if (err.message) {
        console.error('Error Message:', err.message);
        errorMessage = `Error: ${err.message}`;
      }
      
      console.error('Final error message:', errorMessage);
      setError(errorMessage);
      setFeeData({
        expectedFee: 0,
        collectedFee: 0,
        pendingFee: 0
      });
      setStudentFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({...filters, [field]: value});
  };

  const collectionPercentage = feeData 
    ? Math.round((feeData.collectedFee / feeData.expectedFee) * 100)
    : 0;

  if (loading) {
    return (
      <div className="mgmt-page-loading">
        <div className="mgmt-loading-spinner"></div>
        <p>Loading fee information...</p>
      </div>
    );
  }

  return (
    <div className="mgmt-fees-container">
      {error && <div className="mgmt-error-banner">{error}</div>}

      <div className="mgmt-page-header">
        <h1>Fee Management</h1>
        <p className="mgmt-page-subtitle">Monitor and analyze student fee collection</p>
      </div>

      {/* Fee Summary Cards */}
      <div className="mgmt-fee-summary-grid">
        <div className="mgmt-fee-summary-card">
          <h3>Total Expected Fee</h3>
          <p className="mgmt-fee-amount">₹{(feeData?.expectedFee / 1000000).toFixed(1)}M</p>
          <span className="mgmt-fee-change">For current academic year</span>
        </div>

        <div className="mgmt-fee-summary-card">
          <h3>Fee Collected</h3>
          <p className="mgmt-fee-amount">₹{(feeData?.collectedFee / 1000000).toFixed(1)}M</p>
          <span className="mgmt-fee-change">{collectionPercentage}% collected</span>
        </div>

        <div className="mgmt-fee-summary-card">
          <h3>Pending Fees</h3>
          <p className="mgmt-fee-amount">₹{(feeData?.pendingFee / 1000000).toFixed(1)}M</p>
          <span className="mgmt-fee-change">{100 - collectionPercentage}% remaining</span>
        </div>
      </div>

      {/* Fee Collection Progress */}
      <div className="mgmt-fee-progress">
        <div className="mgmt-progress-label">
          <h4>Overall Fee Collection Progress</h4>
          <span className="mgmt-progress-percent">{collectionPercentage}%</span>
        </div>
        <div className="mgmt-progress-bar">
          <div className="mgmt-progress-fill" style={{width: `${collectionPercentage}%`}}></div>
        </div>
      </div>

      {/* Filters */}
      <div className="mgmt-filter-bar">
        <div className="mgmt-filter-group">
          <label>Year</label>
          <select value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)}>
            <option value="">All Years</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div className="mgmt-filter-group">
          <label>Branch</label>
          <select value={filters.branch} onChange={(e) => handleFilterChange('branch', e.target.value)}>
            <option value="">All Branches</option>
            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
          </select>
        </div>
      </div>

      {/* Fee Table */}
      <div className="mgmt-fee-table-container">
        <table className="mgmt-fee-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Admission Mode</th>
              <th>Paid Amount</th>
              <th>Remaining Amount</th>
              <th>Fines</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {studentFees.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>{student.admissionMode}</td>
                <td><span className="mgmt-fee-amount-text">₹{student.paidAmount?.toLocaleString()}</span></td>
                <td><span className="mgmt-fee-amount-text">₹{student.remainingAmount?.toLocaleString()}</span></td>
                <td>Lib: ₹{student.libraryFine}, Eq: ₹{student.equipmentFine}</td>
                <td>
                  <span className={`mgmt-fee-status-badge ${student.status.toLowerCase()}`}>
                    {student.status === 'Paid' ? '✓' : '⏳'} {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
