import React from 'react';
import { Box, Text, HStack, Button, Badge } from '@chakra-ui/react';
import { useDemoContext } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';

const DemoBanner = () => {
  const { isDemoMode, exitDemoMode } = useDemoContext();
  const { getCurrentThemeName } = useTheme();

  if (!isDemoMode) return null;

  const handleExitDemo = () => {
    exitDemoMode();
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <Box
      bg="orange.400"
      color="white"
      py={2}
      px={4}
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="banner"
      boxShadow="sm"
    >
      <HStack justify="space-between" maxW="7xl" mx="auto">
        <HStack spacing={3}>
          <Badge colorScheme="orange" variant="solid" fontSize="xs">
            DEMO
          </Badge>
          <Text fontSize="sm" fontWeight="medium">
            🎭 Estás en modo demostración - Todos los datos son de ejemplo
          </Text>
          {isDemoMode && (
            <Badge colorScheme="whiteAlpha" variant="outline" fontSize="xs" color="white" borderColor="white">
              Tema: {getCurrentThemeName()}
            </Badge>
          )}
        </HStack>
        
        <Button
          size="xs"
          variant="outline"
          colorScheme="whiteAlpha"
          color="white"
          borderColor="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={handleExitDemo}
        >
          Salir del Demo
        </Button>
      </HStack>
    </Box>
  );
};

export default DemoBanner;