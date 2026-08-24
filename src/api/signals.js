import client from './client';

export const signalApi = {
  getSignals: (params) => client.get('/signals', { params }),
  getLatest: () => client.get('/signals/latest'),
  getClosed: (params) => client.get('/signals/closed', { params }),
  getDetail: (id) => client.get(`/signals/${id}`),
  getCategories: () => client.get('/signals'), // Categories available in signal data
};
