import axios, { AxiosRequestConfig } from 'axios';

import { getToken, setToken, getRefreshToken, setRefreshToken } from './token';

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

// ─── Token Refresh Logic ───────────────────────────────────────────────────
// Guard to prevent multiple simultaneous refresh requests
let isRefreshing = false;
// Queue of requests that failed while a refresh was in progress
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const clearSessionAndRedirect = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth_user');
  const currentPath = window.location.pathname;
  if (!currentPath.startsWith('/auth')) {
    window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

// Handle 401 — try silent token refresh first, then fall back to logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the failing request IS the refresh call itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        clearSessionAndRedirect();
        return Promise.reject(error);
      }

      try {
        // Call the backend refresh endpoint (no auth header needed — uses the refresh token in body)
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const newAccessToken: string = data.token;
        const newRefreshToken: string = data.refreshToken ?? refreshToken;

        setToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        // Also update legacy localStorage key used by auth store
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }

        // Unblock all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request with the fresh access token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Offline caching for mutation requests
    if (typeof window !== 'undefined' && !navigator.onLine && error.config) {
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

