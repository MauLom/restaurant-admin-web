import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    // Redirect to the menu page if the user is not logged in
    return <Navigate to="/menu" />;
  }

  // Otherwise, render the children components (e.g., Inventory, Orders)
  return children;
};

export default ProtectedRoute;
