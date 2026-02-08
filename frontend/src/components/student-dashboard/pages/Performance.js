import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Performance.css';

const Performance = () => {
  const [academics, setAcademics] = useState(null);
  const [backlogs, setBacklogs] = useState(null);
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSemester, setActiveSemester] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [academicsData, backlogsData, examDataResponse] = await Promise.all([
        studentService.getAcademics(),
        studentService.getBacklogs(),
        studentService.getExamData(),
      ]);
      setAcademics(academicsData);
      setBacklogs(backlogsData);
      setExamData(examDataResponse);
      
      // Set initial semester
      if (examDataResponse && examDataResponse.length > 0) {
        const semesters = [...new Set(examDataResponse.map(e => e.semester_id))];
        setActiveSemester(Math.max(...semesters));
      }
    } catch (err) {
      setError('Failed to load performance data - showing demo data');
      console.error(err);

      // Demo fallback data
      const demoExamData = [
        { semester_id: 7, mid_id: 1, course_id: 'CS101', mid_marks: 16, quiz_marks: 4, assignment_marks: 4 },
        { semester_id: 7, mid_id: 1, course_id: 'CS102', mid_marks: 14, quiz_marks: 3, assignment_marks: 4 },
        { semester_id: 6, mid_id: 2, course_id: 'CS201', mid_marks: 15, quiz_marks: 4, assignment_marks: 3 },
      ];
      const demoAcademics = [
        { semester_id: 7, course_code: 'CS101', marks: 85 },
        { semester_id: 7, course_code: 'CS102', marks: 78 },
      ];
      const demoBacklogs = [];

      setExamData(demoExamData);
      setAcademics(demoAcademics);
      setBacklogs(demoBacklogs);
      if (demoExamData.length > 0) setActiveSemester(Math.max(...demoExamData.map(e => e.semester_id)));
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!examData || examData.length === 0) {
      return { avgMid: 0, avgQuiz: 0, avgAssignment: 0, totalAverage: 0 };
    }

    const mids = examData.map(e => e.mid_marks);
    const quizzes = examData.map(e => e.quiz_marks);
    const assignments = examData.map(e => e.assignment_marks);

    const avgMid = (mids.reduce((a, b) => a + b, 0) / mids.length).toFixed(2);
    const avgQuiz = (quizzes.reduce((a, b) => a + b, 0) / quizzes.length).toFixed(2);
    const avgAssignment = (assignments.reduce((a, b) => a + b, 0) / assignments.length).toFixed(2);
    const totalAverage = ((parseFloat(avgMid) * 0.6 + parseFloat(avgQuiz) * 0.2 + parseFloat(avgAssignment) * 0.2) / 2).toFixed(2);

    return { avgMid, avgQuiz, avgAssignment, totalAverage };
  };

  const getSemesterExamData = (semId) => {
    if (!examData) return [];
    return examData.filter(e => e.semester_id === semId);
  };

  const getUniqueSemesters = () => {
    if (!examData) return [];
    return [...new Set(examData.map(e => e.semester_id))].sort((a, b) => b - a);
  };

  const calculateCGPABySemester = () => {
    if (!examData || examData.length === 0) return [];

    const semesterMap = {};

    // Group by semester and calculate CGPA
    examData.forEach(exam => {
      const sem = exam.semester_id;
      if (!semesterMap[sem]) {
        semesterMap[sem] = { totalMarks: 0, count: 0, courses: [] };
      }

      const totalMarks = exam.mid_marks + exam.quiz_marks + exam.assignment_marks;
      const courseScore = (totalMarks / 30) * 10; // Convert to 10-point scale

      semesterMap[sem].totalMarks += courseScore;
      semesterMap[sem].count += 1;
      semesterMap[sem].courses.push(exam.course_id);
    });

    // Calculate average CGPA per semester
    const cgpaData = Object.keys(semesterMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(sem => ({
        semester: `Sem ${sem}`,
        semesterId: parseInt(sem),
        cgpa: (semesterMap[sem].totalMarks / semesterMap[sem].count).toFixed(2),
        cgpaFloat: parseFloat((semesterMap[sem].totalMarks / semesterMap[sem].count).toFixed(2)),
      }));

    return cgpaData;
  };

  const currentSemData = activeSemester === 'all' ? examData : getSemesterExamData(activeSemester);
  const metrics = calculateMetrics();
  const semesters = getUniqueSemesters();
  const cgpaData = calculateCGPABySemester();

  return (
    <div className="performance-page">
      {error && <div className="error-banner">{error}</div>}

      <div className="page-header">
        <h1>📊 Academic Performance</h1>
        <p className="page-subtitle">Comprehensive performance analytics & exam insights</p>
      </div>

      {/* PERFORMANCE OVERVIEW CARDS */}
      <section className="metrics-section">
        <h2 className="section-title">Overall Performance</h2>
        <div className="metrics-grid">
          <div className="metric-card mid-card">
            <div className="metric-header">
              <span className="metric-label">Average Mid Marks</span>
              <span className="metric-icon">📝</span>
            </div>
            <div className="metric-display">
              <span className="metric-value">{metrics.avgMid}</span>
              <span className="metric-unit">/ 20</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(parseFloat(metrics.avgMid) / 20) * 100}%` }}></div>
              </div>
              <span className="progress-text">{Math.round((parseFloat(metrics.avgMid) / 20) * 100)}%</span>
            </div>
          </div>

          <div className="metric-card quiz-card">
            <div className="metric-header">
              <span className="metric-label">Average Quiz Marks</span>
              <span className="metric-icon">✏️</span>
            </div>
            <div className="metric-display">
              <span className="metric-value">{metrics.avgQuiz}</span>
              <span className="metric-unit">/ 5</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(parseFloat(metrics.avgQuiz) / 5) * 100}%` }}></div>
              </div>
              <span className="progress-text">{Math.round((parseFloat(metrics.avgQuiz) / 5) * 100)}%</span>
            </div>
          </div>

          <div className="metric-card assignment-card">
            <div className="metric-header">
              <span className="metric-label">Average Assignment Marks</span>
              <span className="metric-icon">📋</span>
            </div>
            <div className="metric-display">
              <span className="metric-value">{metrics.avgAssignment}</span>
              <span className="metric-unit">/ 5</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(parseFloat(metrics.avgAssignment) / 5) * 100}%` }}></div>
              </div>
              <span className="progress-text">{Math.round((parseFloat(metrics.avgAssignment) / 5) * 100)}%</span>
            </div>
          </div>

          <div className="metric-card overall-card">
            <div className="metric-header">
              <span className="metric-label">Overall Score</span>
              <span className="metric-icon">⭐</span>
            </div>
            <div className="metric-display">
              <span className="metric-value">{metrics.totalAverage}</span>
              <span className="metric-unit">/ 10</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(parseFloat(metrics.totalAverage) / 10) * 100}%` }}></div>
              </div>
              <span className="progress-text">{Math.round((parseFloat(metrics.totalAverage) / 10) * 100)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* CGPA BY SEMESTER CHART */}
      <section className="cgpa-chart-section">
        <h2 className="section-title">📊 CGPA Progress by Semester</h2>
        <p className="section-subtitle">Semester-wise performance trend</p>
        
        {cgpaData && cgpaData.length > 0 ? (
          <div className="cgpa-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cgpaData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ecf5" />
                <XAxis type="number" domain={[0, 10]} stroke="#666" />
                <YAxis 
                  dataKey="semester" 
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
                  formatter={(value) => [`${value}/10`, 'CGPA']}
                  cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
                />
                <Bar 
                  dataKey="cgpaFloat" 
                  fill="#667eea" 
                  radius={[0, 8, 8, 0]}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {cgpaData.map((entry, index) => {
                    let color = '#667eea';
                    if (entry.cgpaFloat >= 9) color = '#27ae60'; // Excellent - Green
                    else if (entry.cgpaFloat >= 8) color = '#2ecc71'; // Very Good - Light Green
                    else if (entry.cgpaFloat >= 7) color = '#3498db'; // Good - Blue
                    else if (entry.cgpaFloat >= 6) color = '#f39c12'; // Average - Orange
                    else color = '#e74c3c'; // Poor - Red
                    
                    return <Bar key={`bar-${index}`} dataKey="cgpaFloat" fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* CGPA Statistics */}
            <div className="cgpa-stats">
              <div className="stat-item">
                <span className="stat-label">Highest CGPA</span>
                <span className="stat-value">{Math.max(...cgpaData.map(d => d.cgpaFloat)).toFixed(2)}</span>
                <span className="stat-unit">/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lowest CGPA</span>
                <span className="stat-value">{Math.min(...cgpaData.map(d => d.cgpaFloat)).toFixed(2)}</span>
                <span className="stat-unit">/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average CGPA</span>
                <span className="stat-value">
                  {(cgpaData.reduce((sum, d) => sum + d.cgpaFloat, 0) / cgpaData.length).toFixed(2)}
                </span>
                <span className="stat-unit">/10</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Semesters</span>
                <span className="stat-value">{cgpaData.length}</span>
                <span className="stat-unit">sems</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No CGPA data available</p>
          </div>
        )}
      </section>

      {/* MID EXAM SCORES BY SEMESTER */}
      <section className="exam-section">
        <h2 className="section-title">📝 Mid Exam Performance</h2>
        
        <div className="semester-filter">
          <button 
            className={`filter-btn ${activeSemester === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSemester('all')}
          >
            All Semesters
          </button>
          {semesters.map(sem => (
            <button 
              key={sem}
              className={`filter-btn ${activeSemester === sem ? 'active' : ''}`}
              onClick={() => setActiveSemester(sem)}
            >
              Semester {sem}
            </button>
          ))}
        </div>

        {currentSemData && currentSemData.length > 0 ? (
          <div className="exam-courses-container">
            {currentSemData.map((exam, idx) => {
              const totalMarks = exam.total_marks;
              const percentage = Math.round((totalMarks / 30) * 100);
              const getGrade = (marks) => {
                if (marks >= 27) return 'A+';
                if (marks >= 24) return 'A';
                if (marks >= 21) return 'B';
                if (marks >= 18) return 'C';
                if (marks >= 15) return 'D';
                return 'F';
              };

              return (
                <div key={idx} className="exam-course-card">
                  <div className="course-header">
                    <div className="course-info">
                      <h3 className="course-code">{exam.course_id}</h3>
                      <span className="semester-label">Sem {exam.semester_id} | Mid {exam.mid_id}</span>
                    </div>
                    <div className="grade-badge" style={{ 
                      backgroundColor: percentage >= 80 ? '#27ae60' : percentage >= 60 ? '#f39c12' : '#e74c3c'
                    }}>
                      <span className="grade">{getGrade(totalMarks)}</span>
                      <span className="percentage">{percentage}%</span>
                    </div>
                  </div>

                  <div className="marks-breakdown">
                    <div className="mark-item">
                      <span className="mark-label">Mid Exam</span>
                      <div className="mark-bar">
                        <div className="mark-fill" style={{ width: `${(exam.mid_marks / 20) * 100}%`, backgroundColor: '#667eea' }}></div>
                      </div>
                      <span className="mark-score">{exam.mid_marks}/20</span>
                    </div>

                    <div className="mark-item">
                      <span className="mark-label">Quiz</span>
                      <div className="mark-bar">
                        <div className="mark-fill" style={{ width: `${(exam.quiz_marks / 5) * 100}%`, backgroundColor: '#764ba2' }}></div>
                      </div>
                      <span className="mark-score">{exam.quiz_marks}/5</span>
                    </div>

                    <div className="mark-item">
                      <span className="mark-label">Assignment</span>
                      <div className="mark-bar">
                        <div className="mark-fill" style={{ width: `${(exam.assignment_marks / 5) * 100}%`, backgroundColor: '#4ecdc4' }}></div>
                      </div>
                      <span className="mark-score">{exam.assignment_marks}/5</span>
                    </div>
                  </div>

                  <div className="total-marks-display">
                    <span className="total-label">Total Score</span>
                    <span className="total-value">{totalMarks}</span>
                    <span className="total-unit">/30</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📚</span>
            <p>No exam data available for this semester</p>
          </div>
        )}
      </section>

      {/* ACADEMIC RECORDS TABLE */}
      <section className="academic-section">
        <h2 className="section-title">📖 Academic Records</h2>
        {academics && academics.length > 0 ? (
          <div className="table-wrapper">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Semester</th>
                  <th>Course Code</th>
                  <th>Marks</th>
                  <th>Attendance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {academics.map((record, idx) => (
                  <tr key={idx} className={record.marks === -1 ? 'backlog-row' : ''}>
                    <td className="sem-cell">Sem {record.semester_id}</td>
                    <td className="course-cell">{record.course_code}</td>
                    <td className="marks-cell">
                      {record.marks !== -1 ? record.marks : 'Backlog'}
                    </td>
                    <td className="attendance-cell">{record.attendance}%</td>
                    <td className="status-cell">
                      <span className={`status-badge ${record.marks !== -1 ? 'passed' : 'backlog'}`}>
                        {record.marks !== -1 ? '✓ Passed' : '⚠ Backlog'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📚</span>
            <p>No academic records available</p>
          </div>
        )}
      </section>

      {/* BACKLOGS SECTION */}
      <section className="backlogs-section">
        <h2 className="section-title">⚠️ Backlogs Status</h2>
        {backlogs && backlogs.length > 0 ? (
          <div className="backlogs-grid">
            {backlogs.map((backlog, idx) => (
              <div key={idx} className="backlog-card">
                <div className="backlog-icon">⚠️</div>
                <h3 className="backlog-course">Semester {backlog.semester_id}</h3>
                <p className="backlog-code">{backlog.course_id}</p>
                <span className="backlog-status">Action Required</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state success">
            <span className="empty-icon">✨</span>
            <h2>No Backlogs!</h2>
            <p>Great job! Keep up the excellent work.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Performance;
