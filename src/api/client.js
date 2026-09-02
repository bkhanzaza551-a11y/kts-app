import axios from 'axios';
import { storage } from '../utils/storage';

const API_BASE = 'https://kts-backend-production.up.railway.app/api/v1';

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
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
        await storage.clearAuth();
        if (logoutCallback) {
          logoutCallback();
        }
      }
    }

    let message = 'Network connection issue. Please check your internet and try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else if (error.message && !error.message.includes('Network Error')) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export default client;
