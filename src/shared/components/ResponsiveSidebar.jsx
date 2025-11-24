import React from 'react';
import { Box, VStack, HStack, Button, useBreakpointValue, Tooltip, useTheme } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaHamburger, FaCogs } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';

function ResponsiveSidebar() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { user } = useAuthContext();
  const theme = useTheme();

  if (!user) {
    console.log("No hay usuario disponible");
    return null;
  }

  const hubItems = [
    { name: "Estado del restaurante", path: '/dashboard/restaurant-status', icon: FaUtensils },
    { name: "Gestión de productos", path: '/dashboard/product-management', icon: FaHamburger },
    { name: "Configuraciones", path: '/dashboard/configuration', icon: FaCogs }
  ];

  return isMobile ? (
    <Box
      as="nav"
      width="full"
      bg={theme.colors.interface?.sidebar || "#444"}
      p={4}
      zIndex={10000}
      position="fixed"
      bottom="0"
      left="0"
    >
      <HStack justify="space-around">
        {hubItems.map((hub) => (
          <Tooltip key={hub.name} label={hub.name} aria-label={hub.name}>
            <Button
              as={Link}
              to={hub.path}
              variant="link"
              color="whiteAlpha.900"
              p={2}
            >
              <hub.icon size="24px" />
            </Button>
          </Tooltip>
        ))}
      </HStack>
    </Box>
  ) : (
    <Box
      as="aside"
      width="250px"
      bg={theme.colors.interface?.sidebar || "#444"}
      p={4}
    >
      <VStack align="start" spacing={4}>
        {hubItems.map((hub) => (
          <Button
            key={hub.name}
            as={Link}
            to={hub.path}
            variant="link"
            color="whiteAlpha.900"
          >
            <HStack spacing={2}>
              <hub.icon />
              <span>{hub.name}</span>
            </HStack>
          </Button>
        ))}
      </VStack>
    </Box>
  );
}

export default ResponsiveSidebar;
