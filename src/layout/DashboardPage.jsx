import React from 'react';
import { Box, Flex, Button, HStack, Img } from '@chakra-ui/react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ResponsiveSidebar from '../shared/components/ResponsiveSidebar';
import LanguageSwitcher from '../shared/components/LanguageSwitcher';
import ThemeSwitcher from '../shared/components/ThemeSwitcher';
import DemoTutorial from '../components/DemoTutorial';
import { useLanguage } from '../context/LanguageContext';
import { useDemoContext } from '../context/DemoContext';

function DashboardPage() {
  const {t} = useLanguage();
  const { isDemoMode, exitDemoMode } = useDemoContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current page from pathname for tutorial
  const getCurrentPage = () => {
    const path = location.pathname.split('/').pop();
    return path || 'dashboard';
  };

  const handleLogout = () => {
    if (isDemoMode) {
      exitDemoMode();
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex as="header" justify="space-between" align="center" p={4} bg="#333">
        <Img className="logo" maxW="4rem" src="maui-logo.png" />
        <HStack spacing={4}>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button onClick={handleLogout} variant="ghost" colorScheme="whiteAlpha">
            {t('logout')}
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" flex="1" overflowY="auto" maxHeight="calc(100vh - 64px)">
        <ResponsiveSidebar />
        <Box flex="1" p={4} bg="#222" overflowY="auto" pt={isDemoMode ? 12 : 4}>
          <Outlet />
          <DemoTutorial currentPage={getCurrentPage()} />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardPage;
