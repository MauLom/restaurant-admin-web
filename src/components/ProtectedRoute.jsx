import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuthContext();

  if (!user) {
    console.log("No hay usuario", user)
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />; // Optional: Create an unauthorized page or redirect to a default page
  }

  return children;
}

export default ProtectedRoute;
