import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@kts_token',
  USER: '@kts_user',
  ONBOARDED: '@kts_onboarded',
  THEME: '@kts_theme',
  CURRENCY: '@kts_currency',
  TOUR_COMPLETED: '@kts_tour_completed',
};

export const storage = {
  getToken: () => AsyncStorage.getItem(KEYS.TOKEN),
  setToken: (token) => AsyncStorage.setItem(KEYS.TOKEN, token),
  removeToken: () => AsyncStorage.removeItem(KEYS.TOKEN),

  getUser: async () => {
    const json = await AsyncStorage.getItem(KEYS.USER);
    return json ? JSON.parse(json) : null;
  },
  setUser: (user) => user ? AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)) : AsyncStorage.removeItem(KEYS.USER),
  removeUser: () => AsyncStorage.removeItem(KEYS.USER),

  isOnboarded: async () => {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return val === 'true';
  },
  setOnboarded: () => AsyncStorage.setItem(KEYS.ONBOARDED, 'true'),

  hasSeenTour: async () => {
    const val = await AsyncStorage.getItem(KEYS.TOUR_COMPLETED);
    return val === 'true';
  },
  setTourCompleted: () => AsyncStorage.setItem(KEYS.TOUR_COMPLETED, 'true'),
  resetTour: () => AsyncStorage.removeItem(KEYS.TOUR_COMPLETED),

  getCurrency: async () => {
    const val = await AsyncStorage.getItem(KEYS.CURRENCY);
    return val || 'USD';
  },
  setCurrency: (currency) => AsyncStorage.setItem(KEYS.CURRENCY, currency),

  clearAuth: () => AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]),

  clearAll: () => AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.ONBOARDED, KEYS.CURRENCY, KEYS.THEME, KEYS.TOUR_COMPLETED]),
};

export default storage;
