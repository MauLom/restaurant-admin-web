import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeDemoData, getDemoData, clearDemoData, isDemoMode as checkDemoMode } from '../utils/demoData';

const DemoContext = createContext();

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    // Check if already in demo mode on mount
    const demoModeStatus = checkDemoMode();
    if (demoModeStatus) {
      setIsDemoMode(true);
      setDemoData(getDemoData());
    }
  }, []);

  const enterDemoMode = () => {
    const data = initializeDemoData();
    setIsDemoMode(true);
    setDemoData(data);
    return data;
  };

  const exitDemoMode = () => {
    clearDemoData();
    setIsDemoMode(false);
    setDemoData(null);
  };

  const value = {
    isDemoMode,
    demoData,
    enterDemoMode,
    exitDemoMode,
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