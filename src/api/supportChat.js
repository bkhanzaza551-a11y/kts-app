import client from './client';

export const supportChatApi = {
  createTicket: (subject, description, source = 'manual') =>
    client.post('/support/tickets', { subject, description, priority: 'high', source }),

  getTickets: () => client.get('/support/tickets'),

  getTicket: (id) => client.get(`/support/tickets/${id}`),

  sendReply: (id, message, attachment = null) => {
    if (attachment) {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('attachment', {
        uri: attachment.uri,
        type: attachment.type || 'image/jpeg',
        name: attachment.fileName || 'attachment.jpg',
      });
      return client.post(`/support/tickets/${id}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return client.post(`/support/tickets/${id}/reply`, { message });
  },
};
