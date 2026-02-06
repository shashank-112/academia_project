import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import TPCellNavbar from './shared/TPCellNavbar';
import TPCellSidebar from './shared/TPCellSidebar';
import Home from './pages/Home';
import Students from './pages/Students';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/Common.css';
import './styles/TPCellLayout.css';

const TPCellDashboard = () => {
  const { user, isLoading } = useAuth();

  if (!user || user.role !== 'tpcell') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="tpcell-dashboard-container">
      <TPCellNavbar user={user} />
      <div className="tpcell-main-wrapper">
        <TPCellSidebar />
        <main className="tpcell-main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default TPCellDashboard;
