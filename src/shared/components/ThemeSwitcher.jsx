import React from 'react';
import { Button, useColorModeValue } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';

function ThemeSwitcher() {
  const { applyRandomTheme, getCurrentThemeName } = useTheme();
  
  // Use theme-aware colors for the button
  const buttonBg = useColorModeValue('gray.200', 'gray.600');
  const buttonColor = useColorModeValue('gray.800', 'white');

  const handleThemeChange = () => {
    const newTheme = applyRandomTheme();
    console.log(`Tema cambiado a: ${newTheme.name}`);
  };

  return (
    <Button 
      onClick={handleThemeChange} 
      variant="outline" 
      size="sm"
      bg={buttonBg}
      color={buttonColor}
      borderWidth="1px"
      _hover={{
        transform: 'scale(1.05)',
        transition: 'all 0.2s ease-in-out'
      }}
      _active={{
        transform: 'scale(0.95)'
      }}
      title={`Tema actual: ${getCurrentThemeName()}`}
    >
      🎨 Tema
    </Button>
  );
}

export default ThemeSwitcher;