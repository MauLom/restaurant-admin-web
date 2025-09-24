import React, { createContext, useContext, useState, useEffect } from 'react';
import { extendTheme } from '@chakra-ui/react';
import { Button } from '../theme/components/Button';
import { Select } from '../theme/components/Select';
import { Toast } from '../theme/components/Toast';
import { clientThemes, getThemeByKey, getRandomTheme } from '../theme/clientThemes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentThemeKey, setCurrentThemeKey] = useState('classic');
  const [currentTheme, setCurrentTheme] = useState(null);

  // Function to create Chakra theme from client theme config
  const createChakraTheme = (clientTheme) => {
    return extendTheme({
      styles: {
        global: {
          'html, body, #root': {
            height: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: 'background',
            color: 'text',
          },
          '.logo': {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
          },
        },
      },
      components: {
        Button,
        Select,
        Toast,
      },
      colors: clientTheme.colors,
      fonts: clientTheme.fonts,
      config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
      },
    });
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedThemeKey = localStorage.getItem('clientThemeKey');
    const initialThemeKey = savedThemeKey || 'classic';
    
    setCurrentThemeKey(initialThemeKey);
    const clientTheme = getThemeByKey(initialThemeKey);
    setCurrentTheme(createChakraTheme(clientTheme));
  }, []);

  // Function to change theme
  const changeTheme = (themeKey) => {
    const clientTheme = getThemeByKey(themeKey);
    const chakraTheme = createChakraTheme(clientTheme);
    
    setCurrentThemeKey(themeKey);
    setCurrentTheme(chakraTheme);
    
    // Save to localStorage for persistence
    localStorage.setItem('clientThemeKey', themeKey);
  };

  // Function to apply random theme (for demo purposes)
  const applyRandomTheme = () => {
    const { key, theme } = getRandomTheme();
    const chakraTheme = createChakraTheme(theme);
    
    setCurrentThemeKey(key);
    setCurrentTheme(chakraTheme);
    
    // Save to localStorage
    localStorage.setItem('clientThemeKey', key);
    
    return { key, name: theme.name };
  };

  // Function to reset to default theme
  const resetTheme = () => {
    changeTheme('classic');
    localStorage.removeItem('clientThemeKey');
  };

  const value = {
    currentThemeKey,
    currentTheme,
    changeTheme,
    applyRandomTheme,
    resetTheme,
    availableThemes: clientThemes,
    getCurrentThemeName: () => clientThemes[currentThemeKey]?.name || 'Classic Elegance',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;