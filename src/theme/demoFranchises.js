// Placeholder franchise identities for demo mode logo cycling.
// Uses emoji/text badges instead of real trademarked logos.

const demoFranchises = [
  { key: 'mcdonalds', name: "McDonald's", emoji: '🍔', bg: '#DA291C', color: '#FFC72C' },
  { key: 'burgerking', name: 'Burger King', emoji: '👑', bg: '#D62300', color: '#FFFFFF' },
  { key: 'wendys', name: "Wendy's", emoji: '🍟', bg: '#E2231A', color: '#FFFFFF' },
  { key: 'kfc', name: 'KFC', emoji: '🍗', bg: '#C8102E', color: '#FFFFFF' },
  { key: 'pizzahut', name: 'Pizza Hut', emoji: '🍕', bg: '#EE3124', color: '#FFFFFF' },
  { key: 'tacobell', name: 'Taco Bell', emoji: '🌮', bg: '#702F8A', color: '#FFFFFF' },
  { key: 'starbucks', name: 'Starbucks', emoji: '☕', bg: '#00704A', color: '#FFFFFF' },
  { key: 'subway', name: 'Subway', emoji: '🥪', bg: '#00543D', color: '#FFFFFF' },
];

export const getRandomFranchise = () => {
  return demoFranchises[Math.floor(Math.random() * demoFranchises.length)];
};

export default demoFranchises;
