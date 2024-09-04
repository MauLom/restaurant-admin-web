import React from 'react';
import { Box, Flex, Button, HStack, Img } from '@chakra-ui/react';
import { Outlet, useNavigate } from 'react-router-dom';
import ResponsiveSidebar from '../components/ResponsiveSidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

function DashboardPage() {
  const {t} = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex as="header" justify="space-between" align="center" p={4} bg="#333">
        <Img className="logo" maxW="4rem" src="maui-logo.png" />
        <HStack spacing={4}>
          <LanguageSwitcher />
          <Button onClick={handleLogout} variant="ghost" colorScheme="whiteAlpha">
            {t('logout')}
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" flex="1" overflowY="auto" maxHeight="calc(100vh - 64px)">
        <ResponsiveSidebar />
        <Box flex="1" p={4} bg="#222" overflowY="auto">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardPage;
