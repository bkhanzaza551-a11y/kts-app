import client from './client';

export const chatApi = {
  getRooms: () => client.get('/chat/rooms'),
  getMessages: (roomId, params) => client.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, data) => client.post(`/chat/rooms/${roomId}/messages`, data),
  getPinnedMessages: (roomId) => client.get(`/chat/rooms/${roomId}/pinned`),
  getStickers: () => client.get('/chat/stickers'),
  useSticker: (data) => client.post('/stickers/use', data),
  getAllStickers: () => client.get('/stickers'),
};
