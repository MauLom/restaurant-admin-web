import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from './context/UserContext';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DemoProvider } from './context/DemoContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const container = document.getElementById('root');
const root = createRoot(container);

// Wrapper component to use dynamic theme
const AppWithTheme = () => {
  const { currentTheme } = useTheme();
  
  if (!currentTheme) {
    // Show loading or return null while theme is being initialized
    return null;
  }

  return (
    <ChakraProvider theme={currentTheme}>
      <BrowserRouter>
        <LanguageProvider>
          <UserProvider>
            <AuthProvider>
              <DemoProvider>
                <App />
              </DemoProvider>
            </AuthProvider>
          </UserProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

root.render(
  <ThemeProvider>
    <AppWithTheme />
  </ThemeProvider>
);

reportWebVitals();
