import React from 'react';
import { Button, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { useTheme } from '../../context/ThemeContext';

function ThemeSwitcher() {
  const { applyRandomTheme, getCurrentThemeName } = useTheme();

  const handleThemeChange = () => {
    const newTheme = applyRandomTheme();
    console.log(`Tema cambiado a: ${newTheme.name}`);
  };

  return (
    <VStack spacing={1} align="center">
      <Button 
        onClick={handleThemeChange} 
        variant="outline" 
        size="sm"
        bg="black"
        color="white"
        borderColor="gray.500"
        borderWidth="1px"
        _hover={{
          transform: 'scale(1.05)',
          transition: 'all 0.2s ease-in-out',
          bg: "black",
          borderColor: "gray.400"
        }}
        _active={{
          transform: 'scale(0.95)',
          bg: "black"
        }}
        title="🐛 DEBUG: Herramienta para cambiar temas aleatoriamente durante desarrollo"
      >
        🎨 Tema
      </Button>
      <Text 
        fontSize="xs" 
        color="white"
        opacity={0.8}
        textAlign="center"
        maxW="80px"
        isTruncated
      >
        {getCurrentThemeName()}
      </Text>
    </VStack>
  );
}

export default ThemeSwitcher;