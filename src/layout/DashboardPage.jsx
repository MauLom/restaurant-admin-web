// import React from 'react';
import { Box, Flex, Button, HStack, Img, Text } from '@chakra-ui/react';
import { FaSignOutAlt } from 'react-icons/fa';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import ResponsiveSidebar from '../shared/components/ResponsiveSidebar';
import LanguageSwitcher from '../shared/components/LanguageSwitcher';
import ThemeSwitcher from '../shared/components/ThemeSwitcher';
import HeaderMobileMenu from '../shared/components/HeaderMobileMenu';
import DemoTutorial from '../components/DemoTutorial';
import { useLanguage } from '../context/LanguageContext';
import { useAuthContext } from '../context/AuthContext';
import { useDemoContext } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { MOBILE_NAV_HEIGHT } from '../shared/constants/layout';
import { CLIENT_LOGO_URL } from '../config/branding';

function DashboardPage() {
  const {t} = useLanguage();
  const { isDemoMode, exitDemoMode } = useDemoContext();
  const { user } = useAuthContext();
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
      <Flex as="header" justify="space-between" align="center" p={{ base: 4, md: 6 }} bg={currentTheme.colors.interface?.header || "#333"} minH="80px" gap={2}>
        <HStack spacing={4} minW={0}>
          <Img className="logo" maxW="5rem" src={CLIENT_LOGO_URL} borderRadius={10}/>
          {user?.username && (
            <Text color={currentTheme.colors.text} fontWeight="medium" fontSize="lg">
              {t('greetingLabel').replace('{username}', user.username)}
            </Text>
          )}
        </HStack>
        <HStack spacing={{ base: 2, md: 6 }} flexShrink={0}>
          <Box display={{ base: 'none', md: 'flex' }}>
            <HStack spacing={6}>
              <ThemeSwitcher />
              <LanguageSwitcher />
            </HStack>
          </Box>
          <Box display={{ base: 'flex', md: 'none' }}>
            <HeaderMobileMenu />
          </Box>
          <Button
            onClick={handleLogout}
            variant="ghost"
            colorScheme="whiteAlpha"
            size="lg"
            leftIcon={<FaSignOutAlt />}
            aria-label={t('logout')}
            px={{ base: 3, md: 6 }}
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
            <Box as="span" display={{ base: 'none', md: 'inline' }}>
              {t('logout')}
            </Box>
          </Button>
        </HStack>
      </Flex>
      <Flex as="main" flex="1" minH="0" overflowY="auto">
        <ResponsiveSidebar />
        <Box
          flex="1"
          p={4}
          pb={{ base: `calc(${MOBILE_NAV_HEIGHT} + 1rem)`, md: 4 }}
          bg={currentTheme.colors.interface?.content || "#222"}
          overflowY="auto"
        >
          <Outlet />
          <DemoTutorial currentPage={getCurrentPage()} />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardPage;
