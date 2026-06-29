import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

function ProtectedRoute({ children, requiredAccess = [], allowedRoles = [] }) {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    console.warn("ProtectedRoute: No hay usuario activo");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`ProtectedRoute: Usuario ${user.role} no autorizado para acceder a ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  const userPermissions = user.permissions || [];

  if (requiredAccess.length > 0 && !requiredAccess.some(access => userPermissions.includes(access))) {
    console.warn(`ProtectedRoute: Usuario ${user.role} no autorizado para acceder a ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
