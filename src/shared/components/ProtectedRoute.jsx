import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import permissions from '../../config/permissions';

function ProtectedRoute({ children, requiredAccess = [] }) {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    console.warn("ProtectedRoute: No hay usuario activo");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userPermissions = permissions[user.role];

  if (!userPermissions) {
    console.error("ProtectedRoute: El rol del usuario no tiene permisos configurados:", user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredAccess.length > 0 && !requiredAccess.some(access => userPermissions.access.includes(access))) {
    console.warn(`ProtectedRoute: Usuario ${user.role} no autorizado para acceder a ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
