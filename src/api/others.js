import client from './client';

export const demoApi = {
  getInstructions: () => client.get('/demo-account/instructions'),
  submitRequest: (data) => client.post('/demo-account/request', data),
  getMyRequests: () => client.get('/demo-account/requests'),
  getRequestDetail: (id) => client.get(`/demo-account/requests/${id}`),
};

export const notificationApi = {
  getNotifications: (params) => client.get('/notifications', { params }),
  getUnreadCount: () => client.get('/notifications/unread'),
};

export const deviceApi = {
  register: (data) => client.post('/device/register', data),
  unregister: (data) => client.post('/device/unregister', data),
};

export const legalApi = {
  getPages: () => client.get('/legal'),
  getPage: (slug) => client.get(`/legal/${slug}`),
};
