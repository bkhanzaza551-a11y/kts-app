import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const GOOGLE_WEB_CLIENT_ID = '294042310331-0s9dbhu0ajf4fkmkoik1gg6h27jb01fk.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '294042310331-0s9dbhu0ajf4fkmkoik1gg6h27jb01fk.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  offlineAccess: true,
  scopes: ['profile', 'email'],
});
