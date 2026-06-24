import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDemoData, getDemoData, clearDemoData, isDemoMode as checkDemoMode } from '../utils/demoData';
import { getRandomFranchise } from '../theme/demoFranchises';

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [currentThemeName, setCurrentThemeName] = useState(null);
  const [currentFranchise, setCurrentFranchise] = useState(null);

  useEffect(() => {
    // Check if already in demo mode on mount
    const demoModeStatus = checkDemoMode();
    if (demoModeStatus) {
      setIsDemoMode(true);
      setDemoData(getDemoData());
      setCurrentFranchise(getRandomFranchise());
    }
  }, []);

  const enterDemoMode = (themeContext = null) => {
    const data = initializeDemoData();
    setIsDemoMode(true);
    setDemoData(data);
    setCurrentFranchise(getRandomFranchise());

    // Apply random theme when entering demo mode if theme context is provided
    if (themeContext) {
      const appliedTheme = themeContext.applyRandomTheme();
      setCurrentThemeName(appliedTheme.name);
    }

    return data;
  };

  const exitDemoMode = (themeContext = null) => {
    clearDemoData();
    setIsDemoMode(false);
    setDemoData(null);
    setCurrentThemeName(null);
    setCurrentFranchise(null);

    // Reset to default theme when exiting demo if theme context is provided
    if (themeContext) {
      themeContext.resetTheme();
    }
  };

  // Picks a new random franchise badge (called alongside theme color changes in demo mode)
  const applyRandomFranchise = () => {
    const franchise = getRandomFranchise();
    setCurrentFranchise(franchise);
    return franchise;
  };

  const value = {
    isDemoMode,
    demoData,
    enterDemoMode,
    exitDemoMode,
    currentThemeName,
    currentFranchise,
    applyRandomFranchise,
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
};

export default DemoContext;