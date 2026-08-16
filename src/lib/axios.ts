import axios from 'axios';

import { getToken } from './token';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Include cookies/credentials for auth
});

// Attach JWT token to every outgoing request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — clear tokens and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authEmail');
        sessionStorage.removeItem('authRole');
        sessionStorage.removeItem('authUserId');
        const currentPath = window.location.pathname;
        // Only redirect if we're on a protected page to avoid loop
        if (!currentPath.startsWith('/auth')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // Offline caching for mutation requests
    if (typeof window !== "undefined" && !navigator.onLine && error.config) {
      const { method, url, data } = error.config;
      if (method && ['post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
        // Dynamic import to prevent circular dependency issues
        const { useOfflineSyncStore } = await import('@/store/staff/offline-sync.store');
        useOfflineSyncStore.getState().addAction({
          url: url || '',
          method: method.toUpperCase() as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
          payload: data ? JSON.parse(data) : undefined,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
