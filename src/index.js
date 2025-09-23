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
import theme from './theme';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ChakraProvider theme={theme}>
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

reportWebVitals();
