import React from 'react';
import { Box, Flex, Button, HStack, Img, border } from '@chakra-ui/react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ResponsiveSidebar from '../shared/components/ResponsiveSidebar';
import LanguageSwitcher from '../shared/components/LanguageSwitcher';
import ThemeSwitcher from '../shared/components/ThemeSwitcher';
import DemoTutorial from '../components/DemoTutorial';
import { useLanguage } from '../context/LanguageContext';
import { useDemoContext } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';

function DashboardPage() {
  const {t} = useLanguage();
  const { isDemoMode, exitDemoMode } = useDemoContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme } = useTheme();

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
      <Flex as="header" justify="space-between" align="center" p={6} bg={currentTheme.colors.interface?.header || "#333"} minH="80px">
        <Img className="logo" maxW="5rem" src={currentTheme.logo || "maui-logo.png"} borderRadius={10}/>
        <HStack spacing={6}>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            colorScheme="whiteAlpha"
            size="lg"
            px={6}
            py={3}
            fontSize="md"
            fontWeight="medium"
            borderRadius="md"
            position="relative"
            overflow="hidden"
            _hover={{
              bg: "whiteAlpha.200",
              backdropFilter: "blur(10px)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease-in-out",
              borderWidth: "1px",
              borderColor: "whiteAlpha.400",
              boxShadow: "xl",
              // Efecto liquid glass
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                borderRadius: "md",
                pointerEvents: "none"
              }
            }}
            _active={{
              transform: "translateY(0)",
              bg: "whiteAlpha.300",
              backdropFilter: "blur(8px)"
            }}
          >
            {t('logout')}
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" flex="1" overflowY="auto" maxHeight="calc(100vh - 80px)">
        <ResponsiveSidebar />
        <Box flex="1" p={4} bg={currentTheme.colors.interface?.content || "#222"} overflowY="auto" pt={isDemoMode ? 12 : 4}>
          <Outlet />
          <DemoTutorial currentPage={getCurrentPage()} />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardPage;
