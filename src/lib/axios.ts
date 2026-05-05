import axios from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Include cookies/credentials for auth
});

// Request interceptor: Add JWT token and log request
api.interceptors.request.use(
  (config) => {
    // Add JWT token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Log response and handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.group('[API ERROR DIAGNOSTIC]');
    
    // Log the raw error
    console.error('Raw error object:', error);
    console.error('Error instanceof:', {
      isAxiosError: error?.isAxiosError,
      isError: error instanceof Error,
      constructor: error?.constructor?.name,
    });
    
    // Handle different error scenarios
    const errorInfo: any = {
      timestamp: new Date().toISOString(),
      message: error.message,
      code: error.code,
    };

    if (error?.response) {
      errorInfo.scenario = 'SERVER_RESPONDED_WITH_ERROR';
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
      errorInfo.url = error.config?.url;
      errorInfo.method = error.config?.method;
    } else if (error?.request) {
      errorInfo.scenario = 'NO_RESPONSE_FROM_SERVER';
      errorInfo.requestURL = error.config?.url;
    } else {
      errorInfo.scenario = 'REQUEST_SETUP_ERROR';
    }
    
    console.error('🔴 API ERROR:', errorInfo);
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

export default api;