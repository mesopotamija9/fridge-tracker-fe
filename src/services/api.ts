import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import type { ApiErrorResponse } from '../types/api';

const API_URL = 'http://localhost:9000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshTokenPromise: Promise<string | null> | null = null;

const getAuthContext = () => {
  const authContext = (window as any).__authContext;
  if (!authContext) {
    throw new Error('Auth context not found');
  }
  return authContext;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authContext = getAuthContext();
    const token = authContext.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if ((error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest.headers['X-Retry-After-Refresh']) {
      try {
        if (!refreshTokenPromise) {
          const authContext = getAuthContext();
          refreshTokenPromise = authContext.refreshTokens();
        }

        const newToken = await refreshTokenPromise;
        refreshTokenPromise = null;

        if (!newToken) {
          const authContext = getAuthContext();
          authContext.logout();
          return Promise.reject(error);
        }

        await new Promise(resolve => setTimeout(resolve, 10));

        const newRequest = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            'Authorization': `Bearer ${newToken}`,
            'X-Retry-After-Refresh': 'true'
          }
        };

        return api(newRequest);

      } catch (refreshError) {
        refreshTokenPromise = null;
        const authContext = getAuthContext();
        authContext.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse | ApiErrorResponse>> =>
    api.post('/auth/login', data),
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponse | ApiErrorResponse>> =>
    api.post('/auth/register', data),
  refreshToken: (refreshToken: string): Promise<AxiosResponse<AuthResponse | ApiErrorResponse>> =>
    api.post('/auth/refresh', { refreshToken }),
  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout'),
};

export const itemsApi = {
  getAll: () => api.get('/items'),
  create: (name: string) => api.post('/items', { name }),
  update: (id: string, name: string) => api.put(`/items/${id}`, { name }),
  delete: (id: string) => api.delete(`/items/${id}`),
};

export const fridgesApi = {
  getAll: () => api.get('/fridges'),
  create: (name: string) => api.post('/fridges', { name }),
  delete: (id: string) => api.delete(`/fridges/${id}`),
  getItems: (fridgeId: string) => api.get(`/fridges/${fridgeId}/items`),
  addItem: (fridgeId: string, itemId: string, bestBeforeDate: string, storedAt: string) =>
    api.post(`/fridges/${fridgeId}/items`, { itemId, bestBeforeDate, storedAt }),
  updateItem: (fridgeId: string, fridgeItemId: string, bestBeforeDate: string, storedAt: string) =>
    api.put(`/fridges/${fridgeId}/items/${fridgeItemId}`, { bestBeforeDate, storedAt }),
  removeItem: (fridgeId: string, fridgeItemId: string) =>
    api.delete(`/fridges/${fridgeId}/items/${fridgeItemId}`),
};