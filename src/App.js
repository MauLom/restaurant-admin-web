import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicMenu from './pages/PublicMenu'; // Public menu for non-logged users
import ManageMenu from './pages/ManageMenu'; // Manage menu for logged users (inventory management)
import Orders from './pages/Orders';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute'; // For protected routes
import SideBar from './components/SideBar';
import { Box } from '@chakra-ui/react'; // Import Box from Chakra UI for responsive styling
import TelegramOrders from './pages/TelegramOrders';
import TableBills from './pages/TableBills';

const App = () => {
  return (
    <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} height="100vh">
      {/* Main Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <Box
        as="main"
        flex="1"
        marginLeft={{ base: '0', md: '70px' }}  // No margin on mobile, margin on desktop
        marginBottom={{ base: '70px', md: '0' }} // Add bottom margin on mobile to account for the sidebar at the bottom
        padding="20px"
        overflow="auto"  // Allow scrolling on overflow
        bg="gray.50" // Optional background color for content area
      >
        <Routes>
          {/* Public Route: Menu for creating orders */}
          <Route path="/menu" element={<PublicMenu />} />

          <Route
            path="/manage-menu"
            element={
              <ProtectedRoute>
                <ManageMenu />
              </ProtectedRoute>
            }
          />

          <Route path="/telegram-orders" element={<TelegramOrders />} />
          <Route path="/table-bills" element={<TableBills />} />

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
      </Box>
    </Box>
  );
};

export default App;
