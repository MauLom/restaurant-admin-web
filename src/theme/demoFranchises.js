// Maps each client color theme (clientThemes.js) to a fixed franchise/brand
// shown in the header during demo mode, so picking a color theme always
// shows the same matching logo.

const themeFranchises = {
  classic: { name: 'Mahalo', logo: '/Mahalo.jpg' },
  modern: { name: 'Pizza Hut', logo: '/Pizza Hut.svg' },
  warm: { name: "McDonald's", logo: "/McDonald's.png" },
  forest: { name: 'Starbucks', logo: '/Starbucks.png' },
  purple: { name: "Dunkin' Donuts", logo: "/Dunkin' Donuts.jpg" },
  ocean: { name: 'Burger King', logo: '/Burger King.svg' },
  earth: { name: 'Papa Johns', logo: '/Papa Johns.webp' },
  midnight: { name: 'Subway', logo: '/Subway.jpg' },
};

export const getFranchiseByThemeKey = (key) => {
  return themeFranchises[key] || themeFranchises.classic;
};

export default themeFranchises;
