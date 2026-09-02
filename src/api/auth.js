import client from './client';

export const authApi = {
  login: (data) => client.post('/login', data),
  register: (data) => client.post('/register', data),
  googleAuth: (data) => client.post('/google-auth', data),
  logout: () => client.post('/logout'),
  verifyOtp: (data) => client.post('/verify-otp', data),
  verifySecurityCode: (data) => client.post('/verify-security-code', data),
  verifyEmailOtp: (data) => client.post('/verify-email-otp', data),
  resendEmailOtp: (data) => client.post('/resend-email-otp', data),
  getProfile: () => client.get('/profile'),
  updateProfile: (data) => client.put('/profile', data),
  deleteAccount: () => client.delete('/profile'),
  changePassword: (data) => client.put('/change-password', data),
  forgotPassword: (data) => client.post('/forgot-password', data),
};
