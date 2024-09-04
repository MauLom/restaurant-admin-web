import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import PinLogin from './pages/PinLogin';
import DashboardPage from './pages/DashboardPage';
import SectionPage from './pages/SectionPage';
import OrderPage from './pages/OrderPage';
import InventoryPage from './pages/InventoryPage';
import ReservationPage from './pages/ReservationPage';
import WaiterOrdersPage from './pages/WaiterOrdersPage';
import CashierPage from './pages/CashierPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HostessPage from './pages/HostessPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSettingsPage from './pages/UserSettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationDemoPage from './pages/NotificationDemoPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import GeneratePins from './components/GeneratePins';
import MenuCategoryManagement from './components/MenuCategoryManagement'; // Import the component
import MenuItemManagement from './components/MenuItemManagement'; // Import the component
import OrdersInPreparationPage from './pages/OrdersInPreparationPage';
const App = () => {
  return (
    <Box height="100vh">
      <Routes>
        <Route path="/login" element={<PinLogin />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/dashboard/*" element={<DashboardPage />}>
          <Route
            path="sections"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hostess']}>
                <SectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter']}>
                <OrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hostess']}>
                <ReservationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="waiter-orders"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter']}>
                <WaiterOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="cashier"
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <CashierPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="hostess"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hostess']}>
                <HostessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter', 'hostess', 'cashier', 'kitchen']}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter', 'hostess', 'cashier', 'kitchen']}>
                <UserSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="generate-pins"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GeneratePins />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-categories"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MenuCategoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="manage-items"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MenuItemManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="kitchen-orders"
            element={
              <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <OrdersInPreparationPage />
              </ProtectedRoute>
            }
          />
          <Route path="notifications" element={<NotificationDemoPage />} />
        </Route>

        <Route path="/" element={<PinLogin />} />
      </Routes>
    </Box>
  );
};

export default App;
