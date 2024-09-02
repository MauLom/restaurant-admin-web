import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api', // Base URL for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add any auth tokens, if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Example for auth token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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
