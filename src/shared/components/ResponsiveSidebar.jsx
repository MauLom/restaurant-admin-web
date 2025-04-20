import React from 'react';
import { Box, VStack, HStack, Button, useBreakpointValue, Tooltip } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaListAlt, FaClipboardList, FaUtensils, FaChartLine, FaCashRegister, FaKey, FaTags, FaHamburger } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useAuthContext } from '../../context/AuthContext';

function ResponsiveSidebar() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { t } = useLanguage();
  const { user } = useAuthContext();

  if (!user || !user.role) {
    console.log("No hay usuario");
    return null; // or return a loading indicator, e.g., <Spinner />
  }

  const menuItems = [
    { name: t('orders'), path: '/dashboard/orders', icon: FaListAlt, roles: ['admin', 'waiter'] },
    { name: t('sections'), path: '/dashboard/sections', icon: FaClipboardList, roles: ['admin', 'hostess'] },
    // { name: t('reservations'), path: '/dashboard/reservations', icon: FaUtensils, roles: ['admin', 'hostess'] },
    { name: t('waiterOrders'), path: '/dashboard/waiter-orders', icon: FaListAlt, roles: ['admin', 'waiter'] },
    { name: t('cashier'), path: '/dashboard/cashier', icon: FaCashRegister, roles: ['admin', 'cashier'] },
    { name: t('analytics'), path: '/dashboard/analytics', icon: FaChartLine, roles: ['admin'] },
    { name: t('manageCategories'), path: '/dashboard/manage-categories', icon: FaTags, roles: ['admin'] },
    { name: t('manageItems'), path: '/dashboard/manage-items', icon: FaHamburger, roles: ['admin'] },
    { name: t('inventory'), path: '/dashboard/inventory', icon: FaClipboardList, roles: ['admin'] },
    { name: t('preparationOrders'), path: '/dashboard/kitchen-orders', icon: FaUtensils, roles: ['admin', 'kitchen', 'bar'] }, 

    // { name: t('profile'), path: '/dashboard/profile', icon: FaUserCog, roles: ['admin', 'waiter', 'hostess', 'cashier', 'kitchen'] },
    // { name: t('settings'), path: '/dashboard/settings', icon: FaCogs, roles: ['admin', 'waiter', 'hostess', 'cashier', 'kitchen'] },
    { name: t('generatePins'), path: '/dashboard/generate-pins', icon: FaKey, roles: ['admin'] },
    // { name: t('notifications'), path: '/dashboard/notifications', icon: FaBell, roles: ['admin', 'waiter', 'hostess', 'cashier', 'kitchen'] },
  ];
  

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return isMobile ? (
    <Box as="nav" width="full" bg="#444" p={4} zIndex={10000} position="fixed" bottom="0" left="0">
      <HStack justify="space-around">
        {filteredMenuItems.map((item) => (
          <Tooltip key={item.name} label={item.name} aria-label={item.name}>
            <Button as={Link} to={item.path} variant="link" color="whiteAlpha.900" p={2}>
              <item.icon size="24px" />
            </Button>
          </Tooltip>
        ))}
      </HStack>
    </Box>
  ) : (
    <Box as="aside" width="250px" bg="#444" p={4}>
      <VStack align="start" spacing={4}>
        {filteredMenuItems.map((item) => (
          <Button key={item.name} as={Link} to={item.path} variant="link" color="whiteAlpha.900">
            <HStack spacing={2}>
              <item.icon />
              <span>{item.name}</span>
            </HStack>
          </Button>
        ))}
      </VStack>
    </Box>
  );
}

export default ResponsiveSidebar;
