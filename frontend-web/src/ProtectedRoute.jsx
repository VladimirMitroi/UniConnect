import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('uniconnect_token');
  const userRole = localStorage.getItem('uniconnect_role');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    if (userRole === 'ROLE_STUDENT') {
      return <Navigate to="/catalog" replace />;
    } else if (userRole === 'ROLE_TEACHER') {
      return <Navigate to="/dashboard-profesor" replace />;
    } else if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/admin/sistem" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;