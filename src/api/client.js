import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE = 'https://kts-backend-production.up.railway.app/api/v1';

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const currentRoute = error.config?.url || '';
      if (!currentRoute.includes('/login') && !currentRoute.includes('/register')) {
        await storage.clearAll();
        if (logoutCallback) {
          logoutCallback();
        }
      }
    }
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default client;
