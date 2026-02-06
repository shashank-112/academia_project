import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/login/Login';
import StudentDashboard from './components/student-dashboard/StudentDashboard';
import FacultyDashboard from './components/faculty-dashboard/FacultyDashboard';
import ManagementDashboard from './components/management-dashboard/ManagementDashboard';
import TPCellDashboard from './components/tpcell-dashboard/TPCellDashboard';
import AdminDashboard from './components/admin-dashboard/AdminDashboard';
import './App.css';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/dashboard/student"
        element={
          <PrivateRoute requiredRole="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/faculty/*"
        element={
          <PrivateRoute requiredRole="faculty">
            <FacultyDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Keep backward compatibility with old route */}
      <Route
        path="/dashboard/faculty"
        element={
          <PrivateRoute requiredRole="faculty">
            <FacultyDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/dashboard/management"
        element={
          <PrivateRoute requiredRole="management">
            <ManagementDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/tpcell/*"
        element={
          <PrivateRoute requiredRole="tpcell">
            <TPCellDashboard />
          </PrivateRoute>
        }
      />
      
      {/* Keep backward compatibility with old route */}
      <Route
        path="/dashboard/tpcell"
        element={
          <PrivateRoute requiredRole="tpcell">
            <TPCellDashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/dashboard/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
