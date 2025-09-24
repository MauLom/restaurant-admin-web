import { getDemoData, isDemoMode } from './demoData';

// Mock API responses for demo mode
export const demoApiResponses = {
  '/menu/categories': () => {
    const demoData = getDemoData();
    return { data: demoData?.categories || [] };
  },
  
  '/menu/items': () => {
    const demoData = getDemoData();
    return { data: demoData?.menuItems || [] };
  },
  
  '/inventory': () => {
    const demoData = getDemoData();
    return { data: demoData?.inventory || [] };
  },
  
  '/sections': () => {
    const demoData = getDemoData();
    return { data: demoData?.tables || [] };
  },
  
  '/orders': () => {
    const demoData = getDemoData();
    return { data: demoData?.orders || [] };
  },
  
  '/users': () => {
    const demoData = getDemoData();
    return { data: demoData?.users || [] };
  },
  
  '/users/profile': () => {
    const demoData = getDemoData();
    const adminUser = demoData?.users?.find(user => user.role === 'admin') || {};
    return { 
      data: { 
        user: adminUser,
        isProfileComplete: true 
      } 
    };
  },
  
  '/analytics/daily': () => {
    const demoData = getDemoData();
    return { data: demoData?.analytics || {} };
  }
};

// Demo API interceptor that returns mock data for demo mode
export const createDemoResponse = (url, method = 'GET', data = null) => {
  if (!isDemoMode()) {
    return null; // Not in demo mode, use real API
  }

  // Normalize URL by removing leading slash and query parameters
  const normalizedUrl = url.replace(/^\//, '').split('?')[0];
  
  // Handle GET requests
  if (method === 'GET' && demoApiResponses[`/${normalizedUrl}`]) {
    return Promise.resolve(demoApiResponses[`/${normalizedUrl}`]());
  }
  
  // Handle POST requests (create operations)
  if (method === 'POST') {
    // Simulate successful creation
    return Promise.resolve({ 
      data: { 
        _id: `demo-${Date.now()}`, 
        ...data,
        createdAt: new Date().toISOString() 
      } 
    });
  }
  
  // Handle PUT/PATCH requests (update operations)
  if (method === 'PUT' || method === 'PATCH') {
    // Simulate successful update
    return Promise.resolve({ 
      data: { 
        ...data,
        updatedAt: new Date().toISOString() 
      } 
    });
  }
  
  // Handle DELETE requests
  if (method === 'DELETE') {
    // Simulate successful deletion
    return Promise.resolve({ 
      data: { 
        message: 'Eliminado exitosamente (demo)' 
      } 
    });
  }
  
  // Default response for unhandled endpoints
  return Promise.resolve({ 
    data: { 
      message: 'Demo response',
      timestamp: new Date().toISOString() 
    } 
  });
};

const demoApiModule = { demoApiResponses, createDemoResponse };
export default demoApiModule;