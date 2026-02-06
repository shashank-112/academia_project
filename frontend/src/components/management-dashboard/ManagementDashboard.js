import React, { useState } from 'react';
import DashboardLayout from './layout/DashboardLayout';
import Home from './pages/Home';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Fees from './pages/Fees';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './styles/Common.css';

const ManagementDashboard = () => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'students':
        return <Students />;
      case 'faculty':
        return <Faculty />;
      case 'fees':
        return <Fees />;
      case 'notifications':
        return <Notifications />;
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

export default ManagementDashboard;
