import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@kts_token',
  USER: '@kts_user',
  ONBOARDED: '@kts_onboarded',
  THEME: '@kts_theme',
  CURRENCY: '@kts_currency',
};

export const storage = {
  getToken: () => AsyncStorage.getItem(KEYS.TOKEN),
  setToken: (token) => AsyncStorage.setItem(KEYS.TOKEN, token),
  removeToken: () => AsyncStorage.removeItem(KEYS.TOKEN),

  getUser: async () => {
    const json = await AsyncStorage.getItem(KEYS.USER);
    return json ? JSON.parse(json) : null;
  },
  setUser: (user) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: () => AsyncStorage.removeItem(KEYS.USER),

  isOnboarded: async () => {
    const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
    return val === 'true';
  },
  setOnboarded: () => AsyncStorage.setItem(KEYS.ONBOARDED, 'true'),

  getCurrency: async () => {
    const val = await AsyncStorage.getItem(KEYS.CURRENCY);
    return val || 'USD';
  },
  setCurrency: (currency) => AsyncStorage.setItem(KEYS.CURRENCY, currency),

  clearAll: () => AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.ONBOARDED, KEYS.CURRENCY, KEYS.THEME]),
};

export default storage;
