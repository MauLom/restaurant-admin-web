import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicMenu from './pages/PublicMenu'; // Public menu for non-logged users
import ManageMenu from './pages/ManageMenu'; // Manage menu for logged users (inventory management)
import Orders from './pages/Orders';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute'; // For protected routes
import SideBar from './components/SideBar';
const App = () => {
  return (
    <div style={{ display: 'flex' }}>
      {/* Main Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <div style={{ marginLeft: '70px', padding: '20px', width: '100%' }}>
        <Routes>
          {/* Public Route: Menu for creating orders */}
          <Route path="/menu" element={<PublicMenu />} />

          {/* Protected Route: Manage Menu (inventory management) */}
          <Route
            path="/manage-menu"
            element={
              <ProtectedRoute>
                <ManageMenu />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <ManageMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />

          {/* Settings Page (Public or Protected as needed) */}
          <Route path="/settings" element={<Settings />} />

          {/* Default Route to Public Menu */}
          <Route path="/" element={<PublicMenu />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
