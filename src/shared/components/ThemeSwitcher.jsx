import { Button, VStack, Text } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoContext } from '../../context/DemoContext';

function ThemeSwitcher() {
  const { applyRandomTheme, toggleColorMode, getCurrentThemeName, colorMode } = useTheme();
  const { isDemoMode, applyRandomFranchise, currentFranchise } = useDemoContext();
  const { t } = useLanguage();

  const handleThemeChange = () => {
    if (isDemoMode) {
      const newTheme = applyRandomTheme();
      const newFranchise = applyRandomFranchise();
      console.log(`Tema cambiado a: ${newTheme.name} (${newFranchise.name})`);
    } else {
      const newMode = toggleColorMode();
      console.log(`Modo de color cambiado a: ${newMode}`);
    }
  };

  const buttonLabel = isDemoMode
    ? t('themeButtonLabel')
    : colorMode === 'dark'
      ? t('darkModeButtonLabel')
      : t('lightModeButtonLabel');

  const subLabel = isDemoMode
    ? (currentFranchise ? currentFranchise.name : getCurrentThemeName())
    : colorMode === 'dark'
      ? t('darkModeLabel')
      : t('lightModeLabel');

  return (
    <VStack spacing={2} align="center">
      <Button
        onClick={handleThemeChange}
        variant="outline"
        size="lg"
        px={6}
        py={3}
        bg="black"
        color="white"
        borderColor="gray.500"
        borderWidth="2px"
        fontSize="md"
        fontWeight="medium"
        borderRadius="md"
        minW="120px"
        _hover={{
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
          bg: "#363636",
          borderColor: "gray.400",
          boxShadow: "lg"
        }}
        _active={{
          transform: 'translateY(0)',
          bg: "gray.900",
          boxShadow: "md"
        }}
        title={isDemoMode ? t('themeSwitcherDebugTooltip') : t('colorModeSwitcherTooltip')}
      >
        {buttonLabel}
      </Button>
      <Text
        fontSize="sm"
        color="white"
        opacity={0.9}
        textAlign="center"
        maxW="120px"
        isTruncated
        fontWeight="medium"
      >
        {subLabel}
      </Text>
    </VStack>
  );
}

export default ThemeSwitcher;
