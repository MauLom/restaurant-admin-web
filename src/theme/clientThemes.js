// Client theme configurations for multi-tenant branding
// Each theme represents a different client's brand identity

export const clientThemes = {
  classic: {
    name: 'Classic Elegance',
    logo: '/public/../logo.png',
    colors: {
      background: "#1c1c1c",
      text: "#fff",
      primary: {
        500: "#319795", // teal
      },
      secondary: {
        500: "#ED8936", // orange
      },
      // Interface colors
      header: "#2d2d2d",
      sidebar: "#363636",
      content: "#242424",
      surface: "#2a2a2a",
    },
    fonts: {
      body: "'Arial', sans-serif",
      heading: "'Arial', sans-serif",
    },
  },
  
  modern: {
    name: 'Modern Blue',
    logo: '/public/../logo.png',
    colors: {
      background: "#0d1421", // Deep blue-black
      text: "#e6f7ff",     // Light blue-white
      primary: {
        500: "#1890ff", // Vibrant blue
      },
      secondary: {
        500: "#ff4d4f", // Bright red
      },
      // Interface colors
      header: "#1a2332",
      sidebar: "#243447",
      content: "#15202b",
      surface: "#1e2a3a",
    },
    fonts: {
      body: "'Inter', sans-serif",
      heading: "'Inter', sans-serif",
    },
  },
  
  warm: {
    name: 'Warm Sunset',
    logo: '/public/../logo.png',
    colors: {
      background: "#2d1810", // Dark brown
      text: "#fff8e1",     // Warm cream
      primary: {
        500: "#ff9800", // Orange
      },
      secondary: {
        500: "#f44336", // Red-orange
      },
      // Interface colors
      header: "#3d251a",
      sidebar: "#4d2f1f",
      content: "#361f12",
      surface: "#432818",
    },
    fonts: {
      body: "'Poppins', sans-serif",
      heading: "'Poppins', sans-serif",
    },
  },
  
  forest: {
    name: 'Forest Green',
    logo: '/public/../logo.png',
    colors: {
      background: "#1b2815", // Dark forest green
      text: "#e8f5e8",     // Light mint
      primary: {
        500: "#4caf50", // Vibrant green
      },
      secondary: {
        500: "#ffeb3b", // Bright yellow
      },
      // Interface colors
      header: "#253220",
      sidebar: "#2d3c28",
      content: "#1f2a1a",
      surface: "#243018",
    },
    fonts: {
      body: "'Roboto', sans-serif",
      heading: "'Roboto', sans-serif",
    },
  },
  
  purple: {
    name: 'Royal Purple',
    logo: '/public/../logo.png',
    colors: {
      background: "#2a1b3d", // Dark purple
      text: "#f3e5f5",     // Light lavender
      primary: {
        500: "#9c27b0", // Vibrant purple
      },
      secondary: {
        500: "#00bcd4", // Cyan
      },
      // Interface colors
      header: "#382547",
      sidebar: "#453052",
      content: "#311f3a",
      surface: "#3a2345",
    },
    fonts: {
      body: "'Open Sans', sans-serif",
      heading: "'Open Sans', sans-serif",
    },
  },
  
  ocean: {
    name: 'Ocean Breeze',
    logo: '/public/../logo.png',
    colors: {
      background: "#0f2027", // Deep ocean blue
      text: "#e0f7fa",     // Light cyan
      primary: {
        500: "#00acc1", // Ocean blue
      },
      secondary: {
        500: "#ff5722", // Coral
      },
      // Interface colors
      header: "#1a2f35",
      sidebar: "#243b42",
      content: "#152428",
      surface: "#1e333a",
    },
    fonts: {
      body: "'Lato', sans-serif",
      heading: "'Lato', sans-serif",
    },
  },
  
  earth: {
    name: 'Earth Tones',
    logo: '/public/../logo.png',
    colors: {
      background: "#3e2723", // Rich brown
      text: "#f9f9f9",     // Off-white
      primary: {
        500: "#8d6e63", // Brown
      },
      secondary: {
        500: "#4caf50", // Earth green
      },
      // Interface colors
      header: "#4e332d",
      sidebar: "#5d3f37",
      content: "#462b25",
      surface: "#52362f",
    },
    fonts: {
      body: "'Lato', sans-serif",
      heading: "'Lato', sans-serif",
    },
  },
  
  midnight: {
    name: 'Midnight Blue',
    logo: '/public/../logo.png',
    colors: {
      background: "#0a0e27", // Very dark blue
      text: "#cfd8dc",     // Cool light gray
      primary: {
        500: "#3f51b5", // Indigo
      },
      secondary: {
        500: "#e91e63", // Pink
      },
      // Interface colors
      header: "#151a35",
      sidebar: "#1f2540",
      content: "#0f1329",
      surface: "#181d38",
    },
    fonts: {
      body: "'Source Sans Pro', sans-serif",
      heading: "'Source Sans Pro', sans-serif",
    },
  },
};

// Function to get a random theme for demo purposes
export const getRandomTheme = () => {
  const themeKeys = Object.keys(clientThemes);
  const randomKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
  return {
    key: randomKey,
    theme: clientThemes[randomKey]
  };
};

// Function to get theme by key
export const getThemeByKey = (key) => {
  return clientThemes[key] || clientThemes.classic;
};

// Function to get all available themes
export const getAllThemes = () => {
  return Object.keys(clientThemes).map(key => ({
    key,
    name: clientThemes[key].name,
    preview: {
      primary: clientThemes[key].colors.primary[500],
      secondary: clientThemes[key].colors.secondary[500],
      background: clientThemes[key].colors.background,
    }
  }));
};