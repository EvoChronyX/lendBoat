// API Configuration
export const API_CONFIG = {
  // Development - local backend
  development: {
    baseURL: 'http://localhost:5000',
  },
  // Production - Render backend
  production: {
    baseURL: process.env.VITE_API_URL || 'https://your-render-app.onrender.com', // Replace with your Render URL
  },
  // Staging - can be used for testing
  staging: {
    baseURL: process.env.VITE_API_URL || 'https://your-staging-app.onrender.com',
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';

// Export the current API configuration
export const API_BASE_URL = API_CONFIG[environment as keyof typeof API_CONFIG]?.baseURL || API_CONFIG.development.baseURL;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Log the current API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    environment,
    baseURL: API_BASE_URL,
    mode: import.meta.env.MODE,
  });
} 