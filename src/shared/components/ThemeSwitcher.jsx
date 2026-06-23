import { Button, VStack, Text } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

function ThemeSwitcher() {
  const { applyRandomTheme, getCurrentThemeName } = useTheme();
  const { t } = useLanguage();

  const handleThemeChange = () => {
    const newTheme = applyRandomTheme();
    console.log(`Tema cambiado a: ${newTheme.name}`);
  };

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
        title={t('themeSwitcherDebugTooltip')}
      >
        {t('themeButtonLabel')}
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
        {getCurrentThemeName()}
      </Text>
    </VStack>
  );
}

export default ThemeSwitcher;