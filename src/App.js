import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import PinLogin from './layout/PinLogin';
import DashboardPage from './layout/DashboardPage';
import ProtectedRoute from './shared/components/ProtectedRoute';
import GeneratePins from './shared/components/GeneratePins';
import MenuCategoryManagement from './shared/components/MenuCategoryManagement'; 
import MenuItemManagement from './shared/components/MenuItemManagement'; 
import OrderPage from './features/orders/pages/OrderPage';
import OrdersPreparationPage from './features/orders/pages/OrdersInPreparationPage';
import SectionPage from './features/restaurantLayoutManagement/pages/SectionPage';
import AnalyticsPage from './features/analytics/pages/AnalyticsPage';
import InventoryPage from './features/inventory/pages/InventoryPage';
import CashierPage from './features/teamManagement/pages/CashierPage';
import HostessPage from './features/teamManagement/pages/HostessPage';
import ReservationPage from './features/teamManagement/components/ReservationPage';
import UserProfilePage from './features/teamManagement/pages/UserProfilePage';
import UserSettingsPage from './features/teamManagement/pages/UserSettingsPage';
import NotificationPage from './features/teamManagement/pages/NotificationPage';
import WaiterOrdersPage from './features/teamManagement/pages/WaiterOrdersPage';
const App = () => {
  return (
    <Box height="100vh">
      <Routes>
        <Route path="/login" element={<PinLogin />} />
        {/* <Route path="/complete-profile" element={<CompleteProfilePage />} /> */}
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
                {/* <WaiterOrdersPagez   /> */}
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
              <ProtectedRoute allowedRoles={['admin', 'kitchen', 'bar']}>
                <OrdersPreparationPage />
              </ProtectedRoute>
            }
          />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>

        <Route path="/" element={<PinLogin />} />
      </Routes>
    </Box>
  );
};

export default App;
