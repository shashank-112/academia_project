import React from 'react';
import '../../faculty-dashboard/styles/FacultySidebar.css';

const Sidebar = ({ isOpen, activePage, onPageChange, onClose }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleClick = (id) => {
    if (onPageChange) onPageChange(id);
    if (onClose) onClose();
  };

  return (
    <aside className={`faculty-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="faculty-sidebar-content">
        <nav className="faculty-menu">
          {menuItems.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`faculty-menu-item ${active ? 'active' : ''}`}
                onClick={() => handleClick(item.id)}
              >
                <span className="faculty-menu-icon">{item.icon}</span>
                <span className="faculty-menu-label">{item.label}</span>
                {active && <span className="faculty-menu-indicator"></span>}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
