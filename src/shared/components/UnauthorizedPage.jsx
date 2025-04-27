import React from 'react';
import { Box, Text, Button, VStack, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'; // Importamos el contexto de auth

function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext(); // Usamos el contexto

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
      bg="#1a202c"
      color="white"
      p={6}
    >
      <VStack spacing={6}>
        <Text fontSize="4xl" fontWeight="bold" color="teal.300">
          🚫 Acceso Denegado
        </Text>
        <Text fontSize="lg" textAlign="center">
          {user 
            ? 'No tienes permisos para acceder a esta página con tu cuenta.'
            : 'No tienes permisos para acceder a esta página.'}
        </Text>
        <HStack spacing={4}>
          <Button
            onClick={handleGoBack}
            colorScheme="teal"
            variant="solid"
            _hover={{ bg: 'teal.600' }}
          >
            Volver al Dashboard
          </Button>
          {user && (
            <Button
              onClick={handleLogout}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: 'red.600', color: 'white' }}
            >
              Cerrar Sesión
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

export default UnauthorizedPage;
