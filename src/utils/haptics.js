import { Vibration, Platform } from 'react-native';
import { store } from '../store';

export const triggerHaptic = (type = 'light') => {
  try {
    const state = store.getState();
    if (state.appSettings && state.appSettings.hapticEnabled === false) {
      return; // Haptics are disabled in settings
    }
    
    // Vibrate duration for Android, pattern for iOS is similar but iOS uses different APIs natively. 
    // Vibration.vibrate is a universal fallback.
    if (type === 'light') {
      Vibration.vibrate(Platform.OS === 'ios' ? 10 : 25);
    } else if (type === 'heavy') {
      Vibration.vibrate(Platform.OS === 'ios' ? 20 : 50);
    } else if (type === 'success') {
      Vibration.vibrate([0, 30, 80, 30]);
    } else if (type === 'error') {
      Vibration.vibrate(Platform.OS === 'ios' ? [0, 50, 100, 50, 100, 50] : [0, 100, 80, 100, 80, 100]);
    }
  } catch (e) {
    console.log("Haptic error: ", e);
  }
};
