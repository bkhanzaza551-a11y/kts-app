import client from './client';

export const paymentApi = {
  getPlans: () => client.get('/payments/plans'),
  getSubscription: () => client.get('/payments/subscription'),
  getHistory: (params) => client.get('/payments/history', { params }),
};
