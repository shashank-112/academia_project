import React, { useState, useEffect } from 'react';
import { managementService } from '../../../services/api';
import '../styles/Faculty.css';
import '../styles/Common.css';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const data = await managementService.getAllFaculty();
      setFaculty(data || []);
    } catch (err) {
      console.error('Error loading faculty:', err);
      setError('Failed to load faculty');
      // Demo data
      setFaculty([
        {
          id: 1,
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@college.edu',
          department: 'Computer Science',
          designation: 'Associate Professor',
          qualifications: ['B.Tech CSE', 'M.Tech CSE', 'PhD Computer Science'],
          specialization: 'AI & Machine Learning'
        },
        {
          id: 2,
          name: 'Prof. Priya Singh',
          email: 'priya.singh@college.edu',
          department: 'Electronics',
          designation: 'Assistant Professor',
          qualifications: ['B.Tech ECE', 'M.Tech VLSI'],
          specialization: 'Digital Signal Processing'
        },
        {
          id: 3,
          name: 'Dr. Akshay Patel',
          email: 'akshay.patel@college.edu',
          department: 'Mechanical',
          designation: 'Professor',
          qualifications: ['B.Tech Mechanical', 'M.Tech Thermal', 'PhD Mechanical'],
          specialization: 'Thermal Engineering'
        },
        {
          id: 4,
          name: 'Ms. Neha Sharma',
          email: 'neha.sharma@college.edu',
          department: 'Civil',
          designation: 'Assistant Professor',
          qualifications: ['B.Tech Civil', 'M.Tech Structural'],
          specialization: 'Structural Analysis'
        },
        {
          id: 5,
          name: 'Prof. Amit Verma',
          email: 'amit.verma@college.edu',
          department: 'Computer Science',
          designation: 'Professor',
          qualifications: ['B.Tech CSE', 'M.Tech IT', 'PhD Computer Science'],
          specialization: 'Database Management'
        },
        {
          id: 6,
          name: 'Dr. Sneha Gupta',
          email: 'sneha.gupta@college.edu',
          department: 'Electronics',
          designation: 'Associate Professor',
          qualifications: ['B.Tech ECE', 'M.Tech Communications', 'PhD Electronics'],
          specialization: 'Wireless Communications'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyClick = (member) => {
    setSelectedFaculty(member);
    setShowModal(true);
  };

  return (
    <div className="mgmt-faculty-container">
      {error && <div className="mgmt-error-banner">{error}</div>}

      <div className="mgmt-page-header">
        <h1>Faculty Directory</h1>
        <p className="mgmt-page-subtitle">View complete faculty information and department structure</p>
      </div>

      {/* Faculty Grid */}
      <div className="mgmt-faculty-grid">
        {faculty.map((member) => (
          <div
            key={member.id}
            className="mgmt-faculty-card"
            onClick={() => handleFacultyClick(member)}
          >
            <div className="mgmt-faculty-card-header">
              <div className="mgmt-faculty-avatar">
                {member.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mgmt-faculty-card-body">
              <h3 className="mgmt-faculty-name">{member.name}</h3>
              <p className="mgmt-faculty-designation">{member.designation}</p>
              <p className="mgmt-faculty-department">{member.department}</p>
              <div className="mgmt-faculty-contact">
                <div className="mgmt-faculty-contact-item">
                  <span className="mgmt-faculty-contact-icon">📧</span>
                  <span>{member.email}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Detail Modal */}
      {showModal && selectedFaculty && (
        <div className="mgmt-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mgmt-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mgmt-modal-header">
              <h2>Faculty Details</h2>
              <button className="mgmt-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mgmt-modal-body">
              <div className="mgmt-faculty-detail-modal">
                {/* Left Column */}
                <div className="mgmt-faculty-detail-left">
                  <div className="mgmt-faculty-detail-avatar">
                    {selectedFaculty.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="mgmt-faculty-detail-name">{selectedFaculty.name}</h3>
                  <p className="mgmt-faculty-detail-designation">{selectedFaculty.designation}</p>
                </div>

                {/* Right Column */}
                <div>
                  {/* Professional Info */}
                  <div className="mgmt-faculty-detail-section">
                    <h4>Professional Information</h4>
                    <div className="mgmt-faculty-detail-item">
                      <div className="mgmt-faculty-detail-label">Department</div>
                      <div className="mgmt-faculty-detail-value">{selectedFaculty.department}</div>
                    </div>
                    <div className="mgmt-faculty-detail-item">
                      <div className="mgmt-faculty-detail-label">Designation</div>
                      <div className="mgmt-faculty-detail-value">{selectedFaculty.designation}</div>
                    </div>
                    <div className="mgmt-faculty-detail-item">
                      <div className="mgmt-faculty-detail-label">Specialization</div>
                      <div className="mgmt-faculty-detail-value">{selectedFaculty.specialization}</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mgmt-faculty-detail-section">
                    <h4>Contact Information</h4>
                    <div className="mgmt-faculty-detail-item">
                      <div className="mgmt-faculty-detail-label">Email</div>
                      <div className="mgmt-faculty-detail-value">{selectedFaculty.email}</div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="mgmt-faculty-detail-section">
                    <h4>Qualifications</h4>
                    <div className="mgmt-qualification-tags">
                      {selectedFaculty.qualifications?.map((qual, idx) => (
                        <span key={idx} className="mgmt-qualification-tag">{qual}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
