// Demo data for showcasing the restaurant admin application
export const demoCategories = [
  { _id: '1', name: 'Entradas', description: 'Aperitivos y entradas' },
  { _id: '2', name: 'Platos Principales', description: 'Platos fuertes' },
  { _id: '3', name: 'Postres', description: 'Dulces y postres' },
  { _id: '4', name: 'Bebidas', description: 'Bebidas frías y calientes' },
  { _id: '5', name: 'Cocktails', description: 'Bebidas con alcohol' }
];

export const demoMenuItems = [
  {
    _id: '1',
    name: 'Guacamole con Totopos',
    description: 'Aguacate fresco con especias y totopos caseros',
    price: 120,
    category: '1',
    image: 'https://via.placeholder.com/150x150?text=Guacamole',
    available: true,
    ingredients: ['aguacate', 'cebolla', 'tomate', 'totopos']
  },
  {
    _id: '2',
    name: 'Tacos de Carnitas',
    description: 'Tres tacos de carnitas con cebolla y cilantro',
    price: 180,
    category: '2',
    image: 'https://via.placeholder.com/150x150?text=Tacos',
    available: true,
    ingredients: ['tortilla', 'carnitas', 'cebolla', 'cilantro']
  },
  {
    _id: '3',
    name: 'Quesadilla de Flor de Calabaza',
    description: 'Quesadilla artesanal con queso oaxaca y flor de calabaza',
    price: 150,
    category: '2',
    image: 'https://via.placeholder.com/150x150?text=Quesadilla',
    available: true,
    ingredients: ['tortilla', 'queso', 'flor de calabaza']
  },
  {
    _id: '4',
    name: 'Flan Napolitano',
    description: 'Postre tradicional con caramelo',
    price: 80,
    category: '3',
    image: 'https://via.placeholder.com/150x150?text=Flan',
    available: true,
    ingredients: ['leche', 'huevo', 'azúcar']
  },
  {
    _id: '5',
    name: 'Agua de Horchata',
    description: 'Bebida refrescante de arroz y canela',
    price: 45,
    category: '4',
    image: 'https://via.placeholder.com/150x150?text=Horchata',
    available: true,
    ingredients: ['arroz', 'canela', 'azúcar']
  },
  {
    _id: '6',
    name: 'Margarita Clásica',
    description: 'Tequila, triple sec, limón y sal',
    price: 160,
    category: '5',
    image: 'https://via.placeholder.com/150x150?text=Margarita',
    available: true,
    ingredients: ['tequila', 'triple sec', 'limón', 'sal']
  }
];

export const demoInventoryItems = [
  { _id: '1', name: 'Aguacate', currentStock: 25, minStock: 10, unit: 'piezas' },
  { _id: '2', name: 'Tortillas', currentStock: 200, minStock: 50, unit: 'piezas' },
  { _id: '3', name: 'Carnitas', currentStock: 5, minStock: 2, unit: 'kg' },
  { _id: '4', name: 'Queso Oaxaca', currentStock: 8, minStock: 3, unit: 'kg' },
  { _id: '5', name: 'Tequila', currentStock: 3, minStock: 5, unit: 'botellas' },
  { _id: '6', name: 'Limones', currentStock: 50, minStock: 20, unit: 'piezas' }
];

export const demoTables = [
  { _id: '1', number: 1, capacity: 4, status: 'available', section: 'Terraza' },
  { _id: '2', number: 2, capacity: 2, status: 'occupied', section: 'Interior', guestName: 'Juan Pérez', guestCount: 2 },
  { _id: '3', number: 3, capacity: 6, status: 'occupied', section: 'Terraza', guestName: 'María González', guestCount: 4 },
  { _id: '4', number: 4, capacity: 4, status: 'available', section: 'Interior' },
  { _id: '5', number: 5, capacity: 8, status: 'reserved', section: 'Salón Privado', guestName: 'Evento Empresarial', guestCount: 8 }
];

export const demoSections = [
  {
    _id: 'sec1',
    name: 'Terraza',
    tables: [
      { _id: '1', number: '1', capacity: 4, status: 'available' },
      { _id: '3', number: '3', capacity: 6, status: 'occupied', tableSessionId: 'session1' }
    ]
  },
  {
    _id: 'sec2',
    name: 'Interior',
    tables: [
      { _id: '2', number: '2', capacity: 2, status: 'occupied', tableSessionId: 'session2' },
      { _id: '4', number: '4', capacity: 4, status: 'available' }
    ]
  },
  {
    _id: 'sec3',
    name: 'Salón Privado',
    tables: [
      { _id: '5', number: '5', capacity: 8, status: 'reserved' }
    ]
  }
];

export const demoOrders = [
  {
    _id: '1',
    tableId: '2',
    tableNumber: 2,
    items: [
      { itemId: '1', name: 'Guacamole con Totopos', quantity: 1, price: 120, notes: 'Sin cebolla' },
      { itemId: '2', name: 'Tacos de Carnitas', quantity: 2, price: 180, notes: '' }
    ],
    status: 'pending',
    total: 480,
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    waiter: 'Ana López'
  },
  {
    _id: '2',
    tableId: '3',
    tableNumber: 3,
    items: [
      { itemId: '3', name: 'Quesadilla de Flor de Calabaza', quantity: 2, price: 150, notes: '' },
      { itemId: '5', name: 'Agua de Horchata', quantity: 4, price: 45, notes: '' },
      { itemId: '6', name: 'Margarita Clásica', quantity: 2, price: 160, notes: 'Sin sal' }
    ],
    status: 'in_preparation',
    total: 800,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    waiter: 'Carlos Ruiz'
  }
];

export const demoUsers = [
  {
    _id: 'demo-admin',
    username: 'admin-demo',
    role: 'admin',
    name: 'Administrador Demo',
    pin: '123456',
    email: 'admin@demo.com'
  },
  {
    _id: 'demo-waiter',
    username: 'mesero-demo',
    role: 'waiter',
    name: 'Ana López',
    pin: '111111',
    email: 'mesero@demo.com'
  },
  {
    _id: 'demo-cashier',
    username: 'cajero-demo',
    role: 'cashier',
    name: 'Pedro Martínez',
    pin: '222222',
    email: 'cajero@demo.com'
  }
];

export const demoAnalytics = {
  dailySummary: {
    totalSales: 2800,
    customersServed: 15,
    averageTicket: 186.67,
    topItems: [
      { name: 'Tacos de Carnitas', sold: 8 },
      { name: 'Margarita Clásica', sold: 6 },
      { name: 'Guacamole con Totopos', sold: 5 }
    ]
  },
  salesByWaiter: [
    { waiter: 'Ana López', sales: 1200, tables: 6 },
    { waiter: 'Carlos Ruiz', sales: 1600, tables: 9 }
  ]
};

// Function to initialize demo data in localStorage
export const initializeDemoData = () => {
  const demoData = {
    categories: demoCategories,
    menuItems: demoMenuItems,
    inventory: demoInventoryItems,
    tables: demoTables,
    sections: demoSections,
    orders: demoOrders,
    users: demoUsers,
    analytics: demoAnalytics,
    isDemo: true
  };
  
  localStorage.setItem('demoData', JSON.stringify(demoData));
  localStorage.setItem('isDemoMode', 'true');
  return demoData;
};

// Function to get demo data from localStorage
export const getDemoData = () => {
  const stored = localStorage.getItem('demoData');
  return stored ? JSON.parse(stored) : null;
};

// Function to clear demo data
export const clearDemoData = () => {
  localStorage.removeItem('demoData');
  localStorage.removeItem('isDemoMode');
};

// Function to check if in demo mode
export const isDemoMode = () => {
  return localStorage.getItem('isDemoMode') === 'true';
};

const demoDataModule = {
  demoCategories,
  demoMenuItems,
  demoInventoryItems,
  demoTables,
  demoSections,
  demoOrders,
  demoUsers,
  demoAnalytics,
  initializeDemoData,
  getDemoData,
  clearDemoData,
  isDemoMode
};

export default demoDataModule;