import React from 'react';
import { Box, Text, Button, VStack, HStack, useTheme } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthContext();
  const theme = useTheme();
  const { t } = useLanguage();

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
      <VStack spacing={6}>
        <Text fontSize="4xl" fontWeight="bold" color="teal.300">
          🚫 {t('accessDeniedTitle')}
        </Text>
        <Text fontSize="lg" textAlign="center">
          {user
            ? t('accessDeniedMessageUser')
            : t('accessDeniedMessageGuest')}
        </Text>
        <HStack spacing={4}>
          <Button
            onClick={handleGoBack}
            colorScheme="teal"
            variant="solid"
            _hover={{ bg: 'teal.600' }}
          >
            {t('goToDashboard')}
          </Button>
          {user && (
            <Button
              onClick={handleLogout}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: 'red.600', color: 'white' }}
            >
              {t('logout')}
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

export default UnauthorizedPage;
