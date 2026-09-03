import client from './client';

export const botApi = {
  getBot: () => client.get('/bot'),
  getBotTrades: (params) => client.get('/bot/trades', { params }),
  toggleAutoTrade: () => client.post('/bot/toggle'),
  updateBot: (data) => client.put('/bot', data),
};
