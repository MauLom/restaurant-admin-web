import React from 'react';
import { Box, Text, Button, VStack, HStack, useTheme } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const theme = useTheme();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={theme.colors.background || "#1a202c"}
      color={theme.colors.text || "white"}
      p={6}
    >
      bg={theme.colors.background || "#1a202c"}
      color={theme.colors.text || "white"}
      p={6}
    >
      <VStack spacing={6}>
        <Text fontSize="4xl" fontWeight="bold" color="teal.300">
          🚫 Acceso denegado
        </Text>
        <Text fontSize="lg" textAlign="center">
          {user 
            ? 'Tu cuenta no tiene permisos para acceder a esta sección.'
            : 'No tienes permisos para acceder a esta sección.'}
        </Text>
        <HStack spacing={4}>
          <Button
            onClick={handleGoBack}
            colorScheme="teal"
            variant="solid"
            _hover={{ bg: 'teal.600' }}
          >
            Ir al panel principal
          </Button>
          {user && (
            <Button
              onClick={handleLogout}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: 'red.600', color: 'white' }}
            >
              Cerrar sesión
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

export default UnauthorizedPage;
