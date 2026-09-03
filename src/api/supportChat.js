import client from './client';

export const supportChatApi = {
  createTicket: (subject, description) =>
    client.post('/support/tickets', { subject, description, priority: 'high' }),

  getTickets: () => client.get('/support/tickets'),

  getTicket: (id) => client.get(`/support/tickets/${id}`),

  sendReply: (id, message) => client.post(`/support/tickets/${id}/reply`, { message }),
};
