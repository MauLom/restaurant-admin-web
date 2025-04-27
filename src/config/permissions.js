const permissions = {
    admin: {
      access: [
        'orders',
        'sections',
        'waiterOrders',
        'cashier',
        'analytics',
        'manageCategories',
        'manageItems',
        'inventory',
        'kitchenOrders',
        'generatePins',
      ],
      canEditInventory: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canCloseTables: true,
    },
    waiter: {
      access: [
        'orders',
        'waiterOrders',
      ],
      canOpenTables: true,
      canSendOrders: true,
      canRequestCashier: true,
    },
    cashier: {
      access: [
        'cashier',
      ],
      canProcessPayments: true,
      canViewTips: true,
    },
    kitchen: {
      access: [
        'kitchenOrders',
      ],
      canMarkItemsReady: true,
    },
    bar: {
      access: [
        'kitchenOrders',
      ],
      canMarkItemsReady: true,
    },
    hostess: {
      access: [
        'sections',
      ],
      canManageSeating: true,
    },
  };
  
  export default permissions;
  