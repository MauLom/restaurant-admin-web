import { useEffect, useRef } from 'react';
import { useDemoContext } from '../context/DemoContext';
import { useTheme } from '../context/ThemeContext';

// This component manages the interaction between demo mode and theme changes
const DemoThemeController = () => {
  const { isDemoMode } = useDemoContext();
  const theme = useTheme();
  const hasAppliedTheme = useRef(false);

  useEffect(() => {
    if (isDemoMode && !hasAppliedTheme.current) {
      // Apply random theme only once when entering demo mode
      const appliedTheme = theme.applyRandomTheme();
      hasAppliedTheme.current = true;
      console.log(`Applied random theme: ${appliedTheme.name}`);
    } else if (!isDemoMode && hasAppliedTheme.current) {
      // Reset to default theme when exiting demo mode
      theme.resetTheme();
      hasAppliedTheme.current = false;
    }
  }, [isDemoMode, theme]);

  // This component doesn't render anything
  return null;
};

export default DemoThemeController;