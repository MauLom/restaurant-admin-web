import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// function ProtectedRoute({ children, allowedRoles }) {
//   const { user } = useAuth();

//   if (!user || !allowedRoles.includes(user.role)) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// }

function ProtectedRoute({ children }) {
  return children; // Bypass all checks and just render the children
}
export default ProtectedRoute;
