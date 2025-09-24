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
      background: "#1a202c",
      text: "#f7fafc",
      primary: {
        500: "#3182ce", // blue
      },
      secondary: {
        500: "#e53e3e", // red
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
      background: "#2d1b20",
      text: "#fef5e7",
      primary: {
        500: "#d69e2e", // amber
      },
      secondary: {
        500: "#9f2b2b", // dark red
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
      background: "#1a2f1a",
      text: "#f0fff4",  
      primary: {
        500: "#38a169", // green
      },
      secondary: {
        500: "#ecc94b", // yellow
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
      background: "#2d1b47",
      text: "#faf5ff",
      primary: {
        500: "#805ad5", // purple
      },
      secondary: {
        500: "#38b2ac", // teal
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
      background: "#1a365d",
      text: "#e6fffa",
      primary: {
        500: "#0bc5ea", // cyan
      },
      secondary: {
        500: "#fc8181", // pink
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
      background: "#2f1b14",
      text: "#fffaf0",
      primary: {
        500: "#c05621", // brown
      },
      secondary: {
        500: "#68d391", // light green
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
      background: "#0f1419",
      text: "#e2e8f0",
      primary: {
        500: "#4299e1", // light blue
      },
      secondary: {
        500: "#f56565", // coral
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