import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import PinLogin from './layout/PinLogin';
import DashboardPage from './layout/DashboardPage';
import ProtectedRoute from './shared/components/ProtectedRoute';

// Páginas protegidas
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
import UnauthorizedPage from './shared/components/UnauthorizedPage';
import RestaurantStatusPage from './features/hubs/pages/RestaurantStatusPage';
import ProductManagementPage from './features/hubs/pages/ProductManagementPage';
import ConfigurationPage from './features/hubs/pages/ConfigurationPage';

const App = () => {
  return (
    <Box minHeight="100vh" pb={{ base: "70px", md: "0" }}>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login" element={<PinLogin />} />
        <Route path="/" element={<PinLogin />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Rutas protegidas bajo /dashboard */}
        <Route path="/dashboard/*" element={<DashboardPage />}>

          <Route
            path="sections"
            element={
              <ProtectedRoute requiredAccess={['sections']}>
                <SectionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute requiredAccess={['orders']}>
                <OrderPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="waiter-orders"
            element={
              <ProtectedRoute requiredAccess={['waiterOrders']}>
                <WaiterOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="cashier"
            element={
              <ProtectedRoute requiredAccess={['cashier']}>
                <CashierPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="kitchen-orders"
            element={
              <ProtectedRoute requiredAccess={['kitchenOrders']}>
                <OrdersPreparationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="inventory"
            element={
              <ProtectedRoute requiredAccess={['inventory']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="analytics"
            element={
              <ProtectedRoute requiredAccess={['analytics']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="generate-pins"
            element={
              <ProtectedRoute requiredAccess={['generatePins']}>
                <GeneratePins />
              </ProtectedRoute>
            }
          />

          <Route
            path="manage-categories"
            element={
              <ProtectedRoute requiredAccess={['manageCategories']}>
                <MenuCategoryManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="manage-items"
            element={
              <ProtectedRoute requiredAccess={['manageItems']}>
                <MenuItemManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="reservations"
            element={
              <ProtectedRoute requiredAccess={['reservations']}>
                <ReservationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="hostess"
            element={
              <ProtectedRoute requiredAccess={['hostess']}>
                <HostessPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute requiredAccess={['profile']}>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="settings"
            element={
              <ProtectedRoute requiredAccess={['settings']}>
                <UserSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="restaurant-status"
            element={
              <ProtectedRoute allowedRoles={['admin', 'waiter', 'cashier', 'kitchen', 'bar']}>
                <RestaurantStatusPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="product-management"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="configuration"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ConfigurationPage />
              </ProtectedRoute>
            }
          />


          {/* Esta no tiene protección explícita por ahora */}
          <Route path="notifications" element={<NotificationPage />} />

        </Route>
      </Routes>
    </Box>
  );
};

export default App;
