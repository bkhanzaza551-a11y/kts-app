import client from './client';
import { storage } from '../utils/storage';

export const botApi = {
  getBot: () => client.get('/bot'),
  getBotTrades: (params) => client.get('/bot/trades', { params }),
  toggleAutoTrade: () => client.post('/bot/toggle'),
  updateBot: (data) => client.put('/bot', data),
  getDownloadUrl: async () => {
    const token = await storage.getToken();
    const base = 'https://kts-backend-production.up.railway.app/api/v1/bot/download';
    return token ? `${base}?token=${token}` : base;
  },
};

