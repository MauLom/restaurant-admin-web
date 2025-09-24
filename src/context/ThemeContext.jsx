import React, { createContext, useContext, useState, useEffect } from 'react';
import { extendTheme } from '@chakra-ui/react';
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
        global: (props) => ({
          'html, body': {
            height: '100%',
            margin: 0,
            padding: 0,
            backgroundColor: clientTheme.colors.background,
            color: clientTheme.colors.text,
          },
          '#root': {
            height: '100%',
            backgroundColor: clientTheme.colors.background,
            color: clientTheme.colors.text,
          },
          '.logo': {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
          },
          // Override Chakra's default background colors
          '.chakra-ui-dark': {
            backgroundColor: clientTheme.colors.background,
            color: clientTheme.colors.text,
          },
          // Ensure cards and containers use theme background
          '.chakra-container, .chakra-box': {
            backgroundColor: 'inherit',
          },
        }),
      },
      components: {
        Button: {
          baseStyle: {
            borderRadius: 'md',
            fontWeight: 'semibold',
          },
          variants: {
            solid: {
              bg: clientTheme.colors.primary[500],
              color: 'white',
              _hover: {
                bg: `${clientTheme.colors.primary[500]}DD`, // Slightly more transparent
              },
              _active: {
                bg: `${clientTheme.colors.primary[500]}BB`,
              },
            },
            outline: {
              borderColor: clientTheme.colors.primary[500],
              color: clientTheme.colors.primary[500],
              _hover: {
                bg: `${clientTheme.colors.primary[500]}20`,
              },
            },
            ghost: {
              color: clientTheme.colors.primary[500],
              _hover: {
                bg: `${clientTheme.colors.primary[500]}20`,
              },
            },
          },
          defaultProps: {
            variant: 'solid',
          },
        },
        Select: {
          baseStyle: {
            field: {
              backgroundColor: clientTheme.colors.background,
              color: clientTheme.colors.text,
              borderColor: clientTheme.colors.primary[500],
            },
          },
        },
        Toast,
        // Add Box component styling
        Box: {
          baseStyle: {
            backgroundColor: 'inherit',
          },
        },
        // Add Card component styling for better theme integration
        Card: {
          baseStyle: {
            backgroundColor: `${clientTheme.colors.background}CC`, // Semi-transparent
            color: clientTheme.colors.text,
            borderColor: clientTheme.colors.primary[500],
          },
        },
        // Override Link component to use theme colors
        Link: {
          baseStyle: {
            color: clientTheme.colors.primary[500],
            _hover: {
              color: clientTheme.colors.secondary[500],
              textDecoration: 'none',
            },
          },
        },
      },
      colors: {
        ...clientTheme.colors,
        // Map theme colors to Chakra's semantic color system
        teal: {
          500: clientTheme.colors.primary[500],
        },
        blue: {
          500: clientTheme.colors.primary[500],
        },
        orange: {
          500: clientTheme.colors.secondary[500],
        },
        // Override Chakra's gray scale to match theme
        gray: {
          50: clientTheme.colors.text,
          100: `${clientTheme.colors.text}E6`,
          200: `${clientTheme.colors.text}CC`,
          300: `${clientTheme.colors.text}B3`,
          400: `${clientTheme.colors.text}99`,
          500: `${clientTheme.colors.text}80`,
          600: `${clientTheme.colors.text}66`,
          700: `${clientTheme.colors.text}4D`,
          800: `${clientTheme.colors.text}33`,
          900: `${clientTheme.colors.text}1A`,
        },
      },
      fonts: clientTheme.fonts,
      config: {
        initialColorMode: 'dark',
        useSystemColorMode: false,
      },
      semanticTokens: {
        colors: {
          'chakra-body-text': clientTheme.colors.text,
          'chakra-body-bg': clientTheme.colors.background,
          'chakra-border-color': clientTheme.colors.primary[500],
          'chakra-placeholder-color': `${clientTheme.colors.text}80`,
        },
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