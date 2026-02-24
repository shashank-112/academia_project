import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Attendance.css';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [attendanceResponse, courseResponse] = await Promise.all([
        studentService.getAttendanceSummary(),
        studentService.getCourseAttendance(),
      ]);
      
      setAttendanceData(attendanceResponse);
      setCourseData(courseResponse || []);
      setError(''); // Clear error if API succeeds
    } catch (err) {
      // Show error for missing backend endpoints - do not use demo data
      setError('Attendance endpoints not configured in backend yet');
      console.error(err);
      setAttendanceData(null);
      setCourseData([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (percentage) => {
    if (percentage >= 75) return { status: 'Safe', color: '#27ae60', message: 'Good attendance. Keep it up!' };
    if (percentage >= 65) return { status: 'Warning', color: '#f39c12', message: 'Attendance is acceptable but needs improvement.' };
    return { status: 'Critical', color: '#e74c3c', message: 'Attendance is critical. Improve immediately.' };
  };

  const calculateChartData = () => {
    if (!courseData || courseData.length === 0) return [];
    return courseData.map(course => ({
      course_id: course.course_id,
      percentage: parseFloat(course.attendance_percentage).toFixed(2),
      percentageFloat: parseFloat(course.attendance_percentage),
    }));
  };

  const handleCourseCardClick = (course) => {
    setSelectedCourse(course);
    setShowDetail(true);
  };

  const closeDetailPanel = () => {
    setShowDetail(false);
    setTimeout(() => setSelectedCourse(null), 300);
  };

  const statusInfo = attendanceData ? getStatusMessage(attendanceData.overall_percentage) : null;
  const chartData = calculateChartData();

  return (
    <div className="attendance-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>📅 Attendance Dashboard</h1>
        <p className="page-subtitle">Course-wise attendance tracking and analysis</p>
      </div>

      {/* ATTENDANCE SUMMARY SECTION */}
      <section className="summary-section">
        <h2 className="section-title">Attendance Summary</h2>
        {attendanceData ? (
          <>
        <div className="summary-grid">
          <div className="summary-card overall-card">
            <div className="summary-header">
              <span className="summary-label">Overall Attendance</span>
              <span className="summary-icon">📊</span>
            </div>
            <div className="summary-display">
              <span className="summary-value">{attendanceData?.overall_percentage.toFixed(1)}%</span>
            </div>
            <div className="summary-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${attendanceData?.overall_percentage || 0}%` }}
                ></div>
              </div>
            </div>
            <div 
              className="status-badge"
              style={{ backgroundColor: statusInfo?.color }}
            >
              {statusInfo?.status}
            </div>
          </div>

          <div className="summary-card classes-card">
            <div className="summary-header">
              <span className="summary-label">Total Classes</span>
              <span className="summary-icon">🏫</span>
            </div>
            <div className="summary-display">
              <span className="summary-value">{attendanceData?.total_classes}</span>
              <span className="summary-unit">Conducted</span>
            </div>
          </div>

          <div className="summary-card present-card">
            <div className="summary-header">
              <span className="summary-label">Present</span>
              <span className="summary-icon">✓</span>
            </div>
            <div className="summary-display">
              <span className="summary-value">{attendanceData?.total_present}</span>
              <span className="summary-unit">Classes</span>
            </div>
          </div>

          <div className="summary-card absent-card">
            <div className="summary-header">
              <span className="summary-label">Absent</span>
              <span className="summary-icon">✕</span>
            </div>
            <div className="summary-display">
              <span className="summary-value">{attendanceData?.total_absent}</span>
              <span className="summary-unit">Classes</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusInfo && (
          <div className="status-message" style={{ borderLeftColor: statusInfo.color }}>
            <span className="status-icon" style={{ color: statusInfo.color }}>
              {statusInfo.status === 'Safe' ? '✓' : statusInfo.status === 'Warning' ? '⚠' : '🔴'}
            </span>
            <div className="status-text">
              <h3 style={{ color: statusInfo.color }}>{statusInfo.status}</h3>
              <p>{statusInfo.message}</p>
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No attendance data available. Backend endpoints need to be configured.</p>
          </div>
        )}
      </section>

      {/* COURSE ATTENDANCE CHART */}
      <section className="chart-section">
        <h2 className="section-title">📈 Course-wise Attendance Overview</h2>
        <p className="section-subtitle">Horizontal comparison of attendance rates</p>
        
        {chartData && chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf5" />
                <XAxis type="number" domain={[0, 100]} stroke="#666" />
                <YAxis 
                  dataKey="course_id" 
                  type="category" 
                  stroke="#666"
                  width={75}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                  cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                />
                <Bar 
                  dataKey="percentageFloat" 
                  fill="#667eea"
                  radius={[0, 8, 8, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No attendance data available</p>
          </div>
        )}
      </section>

      {/* COURSE CARDS SECTION */}
      <section className="courses-section">
        <h2 className="section-title">📚 Course-wise Details</h2>
        <p className="section-subtitle">Click any course card to view detailed attendance records</p>
        
        {courseData && courseData.length > 0 ? (
          <div className="courses-grid">
            {courseData.map((course, idx) => {
              const statusMsg = getStatusMessage(course.attendance_percentage);
              const percentage = Math.round((course.present / course.total_classes) * 100);
              
              return (
                <div 
                  key={idx} 
                  className="course-card"
                  onClick={() => handleCourseCardClick(course)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleCourseCardClick(course)}
                >
                  <div className="card-header">
                    <div className="course-info">
                      <h3 className="course-code">{course.course_id}</h3>
                      <span className="semester-label">Sem {course.semester_id}</span>
                    </div>
                    <div 
                      className="attendance-badge"
                      style={{ backgroundColor: statusMsg.color }}
                    >
                      <span className="badge-value">{course.attendance_percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="card-stats">
                    <div className="stat-row">
                      <span className="stat-label">Classes Conducted</span>
                      <span className="stat-value">{course.total_classes}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Present</span>
                      <span className="stat-value present-text">{course.present}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Absent</span>
                      <span className="stat-value absent-text">{course.absent}</span>
                    </div>
                  </div>

                  <div className="attendance-bar">
                    <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="bar-text">{percentage}% Attendance</span>

                  <div className="requirement-info">
                    {course.required_75 > 0 && (
                      <div className="requirement-item">
                        <span className="req-label">To reach 75%</span>
                        <span className="req-value">{course.required_75} more classes</span>
                      </div>
                    )}
                    {course.required_65 > 0 && (
                      <div className="requirement-item">
                        <span className="req-label">To reach 65%</span>
                        <span className="req-value">{course.required_65} more classes</span>
                      </div>
                    )}
                    {course.required_75 === 0 && course.required_65 === 0 && (
                      <div className="requirement-item success">
                        <span className="req-label">✨ Target met!</span>
                      </div>
                    )}
                  </div>

                  <div className="click-hint">Click for detailed record</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📚</span>
            <p>No course data available</p>
          </div>
        )}
      </section>

      {/* DETAIL PANEL OVERLAY */}
      {showDetail && selectedCourse && (
        <>
          <div className="detail-overlay" onClick={closeDetailPanel}></div>
          <div className="detail-panel">
            <button className="close-btn" onClick={closeDetailPanel}>×</button>
            
            <div className="detail-header">
              <h2>{selectedCourse.course_id}</h2>
              <span className="detail-semester">Semester {selectedCourse.semester_id}</span>
            </div>

            <div className="detail-summary">
              <div className="detail-stat">
                <span className="detail-label">Total Classes</span>
                <span className="detail-value">{selectedCourse.total_classes}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-label">Present</span>
                <span className="detail-value present-text">{selectedCourse.present}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-label">Absent</span>
                <span className="detail-value absent-text">{selectedCourse.absent}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-label">Attendance %</span>
                <span className="detail-value" style={{ color: getStatusMessage(selectedCourse.attendance_percentage).color }}>
                  {selectedCourse.attendance_percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Class-wise Record (1-50)</h3>
              <div className="class-records">
                {selectedCourse.class_records && selectedCourse.class_records.map((record, idx) => (
                  <div 
                    key={idx}
                    className={`class-session ${record === 1 ? 'present' : 'absent'}`}
                    title={`Class ${idx + 1}: ${record === 1 ? 'Present' : 'Absent'}`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
              <div className="legend">
                <div><span className="legend-present"></span> Present</div>
                <div><span className="legend-absent"></span> Absent</div>
              </div>
            </div>

            <div className="advisory-section">
              <h3>📌 Advisory</h3>
              <p>
                {selectedCourse.required_75 > 0
                  ? `You need to attend ${selectedCourse.required_75} more classes to reach 75% attendance.`
                  : selectedCourse.required_65 > 0
                  ? `Maintain current attendance or attend ${selectedCourse.required_65} more classes to stay above 65%.`
                  : `Great! You've met the attendance target. Keep maintaining this excellent attendance.`}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
