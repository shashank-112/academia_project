import React from 'react';
import '../styles/DashboardLayout.css';

const Sidebar = ({ activePage, onPageChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫' },
    { id: 'fees', label: 'Fees', icon: '💰' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleNavClick = (id) => {
    onPageChange(id);
    onClose();
  };

  return (
    <div className={`mgmt-sidebar ${isOpen ? 'mgmt-open' : ''}`}>
      <nav className="mgmt-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`mgmt-nav-item ${activePage === item.id ? 'mgmt-active' : ''}`}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="mgmt-nav-icon">{item.icon}</span>
            <span className="mgmt-nav-label">{item.label}</span>
            {activePage === item.id && <span className="mgmt-nav-indicator"></span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
