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

  useEffect(() => {
    loadFeeData();
  }, [filters]);

  const loadFeeData = async () => {
    try {
      setLoading(true);
      const summary = await managementService.getFeeSummary();
      const details = await managementService.getStudentFeeDetails(filters);

      setFeeData(summary || {
        expectedFee: 45000000,
        collectedFee: 30000000,
        pendingFee: 15000000
      });

      setStudentFees(details || [
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
    } catch (err) {
      console.error('Error loading fee data:', err);
      setError('Failed to load fee data');
      setFeeData({
        expectedFee: 45000000,
        collectedFee: 30000000,
        pendingFee: 15000000
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
