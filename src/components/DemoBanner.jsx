import React from 'react';
import { Box, Text, HStack, Button, Badge } from '@chakra-ui/react';
import { useDemoContext } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const DemoBanner = () => {
  const { isDemoMode, exitDemoMode } = useDemoContext();
  const { getCurrentThemeName } = useTheme();
  const { t } = useLanguage();

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
      position="relative"
      zIndex="banner"
      boxShadow="sm"
    >
      <HStack justify="space-between" maxW="7xl" mx="auto">
        <HStack spacing={3}>
          <Badge colorScheme="orange" variant="solid" fontSize="xs">
            {t('demoBadge')}
          </Badge>
          <Text fontSize="sm" fontWeight="medium">
            {t('demoModeBannerMessage')}
          </Text>
          {isDemoMode && (
            <Badge colorScheme="whiteAlpha" variant="outline" fontSize="xs" color="white" borderColor="white">
              {t('demoThemeBadge').replace('{themeName}', getCurrentThemeName())}
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
          {t('exitDemo')}
        </Button>
      </HStack>
    </Box>
  );
};

export default DemoBanner;