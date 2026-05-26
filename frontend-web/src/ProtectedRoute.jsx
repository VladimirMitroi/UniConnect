import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('uniconnect_token');
  const userRole = localStorage.getItem('uniconnect_role');

  // 1. Nu are token? Înseamnă că nu e logat deloc. Îl trimitem la Login.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Rutele au anumite roluri permise. Verificăm dacă rolul lui e pe listă.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    // Dacă nu are voie aici, îl trimitem la "casa" lui în funcție de rol
    if (userRole === 'ROLE_STUDENT') {
      return <Navigate to="/catalog" replace />;
    } else if (userRole === 'ROLE_TEACHER') {
      return <Navigate to="/dashboard-profesor" replace />;
    } else if (userRole === 'ROLE_ADMIN') {
      return <Navigate to="/admin/sistem" replace />;
    }

    // Fallback de siguranță extremă
    return <Navigate to="/" replace />;
  }

  // 3. Dacă a trecut de verificări, are voie! Afișăm componenta (pagina).
  return children;
};

export default ProtectedRoute;