import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import Home from './pages/Home';
import Notifications from './pages/Notifications';
import Performance from './pages/Performance';
import Attendance from './pages/Attendance';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/Common.css';

const StudentDashboard = () => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'notifications':
        return <Notifications />;
      case 'performance':
        return <Performance />;
      case 'attendance':
        return <Attendance />;
      case 'assignments':
        return <Assignments />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <DashboardLayout 
      activePage={activePage} 
      onPageChange={setActivePage}
    >
      {renderPage()}
    </DashboardLayout>
  );
};

export default StudentDashboard;

