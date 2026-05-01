import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Include cookies/credentials for auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
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

// Response interceptor
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
      errorType: error?.constructor?.name,
    };

    if (error?.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorInfo.scenario = 'SERVER_RESPONDED_WITH_ERROR';
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
      errorInfo.url = error.config?.url;
      errorInfo.method = error.config?.method;
      errorInfo.requestData = error.config?.data;
      console.error('🔴 Server responded with error status:', errorInfo);
    } else if (error?.request) {
      // The request was made but no response was received
      errorInfo.scenario = 'NO_RESPONSE_FROM_SERVER';
      errorInfo.requestURL = error.config?.url;
      errorInfo.method = error.config?.method;
      errorInfo.message = error.message;
      errorInfo.code = error.code;
      console.error('🔴 No response from server:', errorInfo);
      console.error('Request object:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorInfo.scenario = 'REQUEST_SETUP_ERROR';
      errorInfo.message = error.message;
      errorInfo.code = error.code;
      console.error('🔴 Error during request setup:', errorInfo);
    }
    
    console.error('Summary:', {
      scenario: errorInfo.scenario,
      message: errorInfo.message || errorInfo.statusText,
      status: errorInfo.status,
      url: errorInfo.url,
    });
    
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

export default api;