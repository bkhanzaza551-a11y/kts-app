import client from './client';

export const aiChatApi = {
  send: (message, conversationHistory = []) =>
    client.post('/ai-chat', { message, conversation_history: conversationHistory }),

  status: () => client.get('/ai-chat/status'),

  stats: () => client.get('/ai-chat/stats'),
};
