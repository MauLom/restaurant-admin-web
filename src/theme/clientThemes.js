// Client theme configurations for multi-tenant branding
// Each theme represents a different client's brand identity

export const clientThemes = {
  classic: {
    name: 'Classic Elegance',
    colors: {
      background: "#1c1c1c",
      text: "#fff",
      primary: {
        500: "#319795", // teal
      },
      secondary: {
        500: "#ED8936", // orange
      },
    },
    fonts: {
      body: "'Arial', sans-serif",
      heading: "'Arial', sans-serif",
    },
  },
  
  modern: {
    name: 'Modern Blue',
    colors: {
      background: "#0d1421", // Deep blue-black
      text: "#e6f7ff",     // Light blue-white
      primary: {
        500: "#1890ff", // Vibrant blue
      },
      secondary: {
        500: "#ff4d4f", // Bright red
      },
    },
    fonts: {
      body: "'Inter', sans-serif",
      heading: "'Inter', sans-serif",
    },
  },
  
  warm: {
    name: 'Warm Sunset',
    colors: {
      background: "#2d1810", // Dark brown
      text: "#fff8e1",     // Warm cream
      primary: {
        500: "#ff9800", // Orange
      },
      secondary: {
        500: "#f44336", // Red-orange
      },
    },
    fonts: {
      body: "'Poppins', sans-serif",
      heading: "'Poppins', sans-serif",
    },
  },
  
  forest: {
    name: 'Forest Green',
    colors: {
      background: "#1b2815", // Dark forest green
      text: "#e8f5e8",     // Light mint
      primary: {
        500: "#4caf50", // Vibrant green
      },
      secondary: {
        500: "#ffeb3b", // Bright yellow
      },
    },
    fonts: {
      body: "'Roboto', sans-serif",
      heading: "'Roboto', sans-serif",
    },
  },
  
  purple: {
    name: 'Royal Purple',
    colors: {
      background: "#2a1b3d", // Dark purple
      text: "#f3e5f5",     // Light lavender
      primary: {
        500: "#9c27b0", // Vibrant purple
      },
      secondary: {
        500: "#00bcd4", // Cyan
      },
    },
    fonts: {
      body: "'Open Sans', sans-serif",
      heading: "'Open Sans', sans-serif",
    },
  },
  
  ocean: {
    name: 'Ocean Breeze',
    colors: {
      background: "#0f2027", // Deep ocean blue
      text: "#e0f7fa",     // Light cyan
      primary: {
        500: "#00acc1", // Ocean blue
      },
      secondary: {
        500: "#ff5722", // Coral
      },
    },
    fonts: {
      body: "'Nunito', sans-serif",
      heading: "'Nunito', sans-serif",
    },
  },
  
  earth: {
    name: 'Earth Tones',
    colors: {
      background: "#3e2723", // Rich brown
      text: "#f9f9f9",     // Off-white
      primary: {
        500: "#8d6e63", // Brown
      },
      secondary: {
        500: "#4caf50", // Earth green
      },
    },
    fonts: {
      body: "'Lato', sans-serif",
      heading: "'Lato', sans-serif",
    },
  },
  
  midnight: {
    name: 'Midnight Blue',
    colors: {
      background: "#0a0e27", // Very dark blue
      text: "#cfd8dc",     // Cool light gray
      primary: {
        500: "#3f51b5", // Indigo
      },
      secondary: {
        500: "#e91e63", // Pink
      },
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