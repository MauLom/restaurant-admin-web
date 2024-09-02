import React from 'react';
import { Box, VStack, HStack, Button, useBreakpointValue, Tooltip } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaListAlt, FaBox, FaClipboardList, FaUtensils, FaUserCog, FaChartLine, FaCashRegister, FaBell, FaCogs } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

function ResponsiveSidebar() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { t } = useLanguage();

  const menuItems = [
    { name: t('orders'), path: '/dashboard/orders', icon: FaListAlt },
    { name: t('inventory'), path: '/dashboard/inventory', icon: FaBox },
    { name: t('sections'), path: '/dashboard/sections', icon: FaClipboardList },
    { name: t('reservations'), path: '/dashboard/reservations', icon: FaUtensils },
    { name: t('waiterOrders'), path: '/dashboard/waiter-orders', icon: FaListAlt },
    { name: t('cashier'), path: '/dashboard/cashier', icon: FaCashRegister },
    { name: t('analytics'), path: '/dashboard/analytics', icon: FaChartLine },
    { name: t('profile'), path: '/dashboard/profile', icon: FaUserCog },
    { name: t('settings'), path: '/dashboard/settings', icon: FaCogs },
    { name: t('notifications'), path: '/dashboard/notifications', icon: FaBell }
  ];

  return isMobile ? (
    <Box as="nav" width="full" bg="#444" p={4} position="fixed" bottom="0" left="0">
      <HStack justify="space-around">
        {menuItems.map((item) => (
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
        {menuItems.map((item) => (
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
