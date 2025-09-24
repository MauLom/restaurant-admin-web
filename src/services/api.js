import axios from 'axios';
import { createDemoResponse } from '../utils/demoApi';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api', // Base URL for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add any auth tokens, if needed
api.interceptors.request.use(
  async (config) => {
    // Check if we should use demo API instead
    const demoResponse = createDemoResponse(config.url, config.method.toUpperCase(), config.data);
    if (demoResponse) {
      // Return demo response by throwing a special error that we'll catch
      const error = new Error('DEMO_RESPONSE');
      error.demoResponse = await demoResponse;
      throw error;
    }

    const token = localStorage.getItem('token'); // Example for auth token
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and demo responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle demo responses
    if (error.message === 'DEMO_RESPONSE' && error.demoResponse) {
      return Promise.resolve(error.demoResponse);
    }

    if (error.response) {
      // Handle common errors (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.error('Unauthorized access - Redirecting to login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
