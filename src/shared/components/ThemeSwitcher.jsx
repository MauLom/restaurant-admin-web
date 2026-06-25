import { Button } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoContext } from '../../context/DemoContext';

function ThemeSwitcher() {
  const { applyRandomTheme, toggleColorMode, colorMode } = useTheme();
  const { isDemoMode } = useDemoContext();
  const { t } = useLanguage();

  const handleThemeChange = () => {
    if (isDemoMode) {
      const newTheme = applyRandomTheme();
      console.log(`Tema cambiado a: ${newTheme.name}`);
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

  return (
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
      flexShrink={0}
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
  );
}

export default ThemeSwitcher;
