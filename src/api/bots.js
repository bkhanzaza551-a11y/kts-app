import client from './client';

export const botApi = {
  getBots: () => client.get('/bots'),
  getBotDetail: (id) => client.get(`/bots/${id}`),
  getBotTrades: (id, params) => client.get(`/bots/${id}/trades`, { params }),
  toggleAutoTrade: (id) => client.post(`/bots/${id}/toggle`),
};
