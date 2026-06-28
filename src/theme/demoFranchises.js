// Maps each client color theme (clientThemes.js) to a fixed franchise/brand
// shown in the header during demo mode, so picking a color theme always
// shows the same matching logo.

const themeFranchises = {
  classic: { name: 'Mahalo', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl7rUf38sS60AJ-56_MHtTbDQSa6VASFU-Je7CS9nLG6WNP6tcu_GEFi8&s=10' },
  modern: { name: 'Pizza Hut', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Pizza_Hut_2025.svg' },
  warm: { name: "McDonald's", logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/McDonald%27s_square_2020.svg' },
  forest: { name: 'Starbucks', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg' },
  purple: { name: "Dunkin' Donuts", logo: 'https://prnewswire2-a.akamaihd.net/p/1893751/sp/189375100/thumbnail/entry_id/0_xcfd6lul/def_height/2700/def_width/2700/version/100012/type/1' },
  ocean: { name: 'Burger King', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Burger_King_2020.svg/960px-Burger_King_2020.svg.png' },
  earth: { name: 'Papa Johns', logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Papa_John%27s_Logo_2019.svg/1920px-Papa_John%27s_Logo_2019.svg.png?_=20190524164312" },
  midnight: { name: 'Subway', logo: 'https://mma.prnewswire.com/media/491471/SUBWAY_Restaurants_Logo.jpg?w=200' },
};

export const getFranchiseByThemeKey = (key) => {
  return themeFranchises[key] || themeFranchises.classic;
};

export default themeFranchises;
