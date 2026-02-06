import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import FacultyNavbar from './shared/FacultyNavbar';
import FacultySidebar from './shared/FacultySidebar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Students from './pages/Students';
import Assessments from './pages/Assessments';
import FacultyNotifications from './pages/FacultyNotifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/Common.css';
import './styles/FacultyLayout.css';

const FacultyDashboard = () => {
  const { user, isLoading } = useAuth();

  if (!user || user.role !== 'faculty') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="faculty-dashboard-container">
      <FacultyNavbar user={user} />
      <div className="faculty-main-wrapper">
        <FacultySidebar />
        <main  style={{ marginTop: "0px" }} className="faculty-main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/students" element={<Students />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/notifications" element={<FacultyNotifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
