import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import signalReducer from './signalSlice';
import chatReducer from './chatSlice';
import botReducer from './botSlice';
import paymentReducer from './paymentSlice';
import educationReducer from './educationSlice';
import notificationReducer from './notificationSlice';
import notificationSettingsReducer from './notificationSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    signals: signalReducer,
    chat: chatReducer,
    bots: botReducer,
    payments: paymentReducer,
    education: educationReducer,
    notifications: notificationReducer,
    notificationSettings: notificationSettingsReducer,
  },
});

export default store;
