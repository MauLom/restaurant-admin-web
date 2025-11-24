import React from 'react';
import { Box, VStack, HStack, Button, useBreakpointValue, Tooltip, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaHamburger, FaCogs } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function ResponsiveSidebar() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { user } = useAuthContext();
  const { currentTheme } = useTheme();

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
      bg={currentTheme.colors.interface?.sidebar || "#444"}
      p={6}
      zIndex={10000}
      position="fixed"
      bottom="0"
      left="0"
      borderTop="2px solid"
      borderColor={currentTheme.colors.primary[500]}
    >
      <HStack justify="space-around">
        {hubItems.map((hub) => (
          <Tooltip key={hub.name} label={hub.name} aria-label={hub.name} placement="top">
            <Button
              as={Link}
              to={hub.path}
              variant="ghost"
              size="lg"
              p={6}
              minW="80px"
              minH="60px"
              bg={`${currentTheme.colors.interface?.surface || "#555"}88`}
              color={currentTheme.colors.text}
              borderRadius="lg"
              flexDirection="column"
              _hover={{
                bg: `${currentTheme.colors.primary[500]}44`, // Transparencia liquid glass
                backdropFilter: "blur(8px)", // Efecto cristal
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out",
                boxShadow: "lg",
                borderWidth: "2px",
                borderColor: `${currentTheme.colors.primary[500]}88`,
                color: "white"
              }}
              _active={{
                transform: "translateY(0)",
                bg: `${currentTheme.colors.primary[500]}66`,
                backdropFilter: "blur(6px)",
                color: "white"
              }}
            >
              <hub.icon size="24px" />
              <Text fontSize="xs" fontWeight="medium" mt={1}>
                {hub.name.split(' ')[0]}
              </Text>
            </Button>
          </Tooltip>
        ))}
      </HStack>
    </Box>
  ) : (
    <Box
      as="aside"
      width="280px"
      bg={currentTheme.colors.interface?.sidebar || "#444"}
      p={6}
      borderRight="2px solid"
      borderColor={currentTheme.colors.primary[500]}
    >
      <VStack align="stretch" spacing={4}>
        {hubItems.map((hub) => (
          <Box
            key={hub.name}
            as={Link}
            to={hub.path}
            p={4}
            minH="70px"
            bg={`${currentTheme.colors.interface?.surface || "#555"}88`}
            borderRadius="lg"
            shadow="md"
            border="1px solid"
            borderColor="transparent"
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            textDecoration="none"
            position="relative"
            role="group"
            _hover={{
              bg: `${currentTheme.colors.primary[500]}33`, // Fondo transparente liquid glass
              backdropFilter: "blur(10px)", // Efecto cristal más fuerte
              transform: 'translateY(-2px)',
              shadow: 'xl',
              borderColor: `${currentTheme.colors.primary[500]}AA`,
              borderWidth: "2px",
              // Efecto de brillo sutil
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, transparent 30%, ${currentTheme.colors.primary[500]}22 50%, transparent 70%)`,
                borderRadius: "lg",
                pointerEvents: "none"
              }
            }}
            _active={{
              transform: 'translateY(0px)',
              shadow: 'md',
              bg: `${currentTheme.colors.primary[500]}55`,
              backdropFilter: "blur(8px)"
            }}
            _focus={{
              outline: 'none',
              ring: 2,
              ringColor: currentTheme.colors.primary[500],
              ringOffset: 2,
            }}
          >
            <HStack spacing={4} align="center">
              <Box
                p={2}
                borderRadius="md"
                bg={`${currentTheme.colors.primary[500]}18`}
                border="1px solid"
                borderColor={`${currentTheme.colors.primary[500]}44`}
                color={currentTheme.colors.primary[500]}
                transition="all 0.2s ease-in-out"
                _groupHover={{
                  bg: "white",
                  borderColor: "white",
                  color: currentTheme.colors.primary[500],
                  boxShadow: "sm"
                }}
              >
                <hub.icon size="20px" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text 
                  fontSize="md" 
                  fontWeight="semibold" 
                  color={currentTheme.colors.text}
                  lineHeight="1.2"
                >
                  {hub.name}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default ResponsiveSidebar;
