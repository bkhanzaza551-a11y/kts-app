import { Platform, Alert } from 'react-native';
import { store } from '../store';
import { fetchNotifications, fetchUnreadCount } from '../store/notificationSlice';
import { fetchSignals } from '../store/signalSlice';
import client from '../api/client';

let messaging = null;
let TokenModule = null;

try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (e) {
  console.log('Firebase Messaging not available - push notifications disabled');
}

try {
  TokenModule = require('@react-native-firebase/messaging').getToken;
} catch (e) {
  // ignore
}

export async function requestNotificationPermission() {
  if (!messaging) return false;

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging().AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging().AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch (e) {
    console.log('Notification permission error:', e);
    return false;
  }
}

export async function getFCMToken() {
  if (!messaging) return null;

  try {
    const token = await messaging().getToken();
    return token;
  } catch (e) {
    console.log('FCM token error:', e);
    return null;
  }
}

export async function registerDeviceWithBackend() {
  if (!messaging) return;

  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) return;

    await client.post('/device/register', {
      fcm_token: fcmToken,
      platform: Platform.OS,
      device_name: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
      os_version: Platform.Version.toString(),
    });

    console.log('Device registered with FCM token');
  } catch (e) {
    console.log('Device registration error:', e);
  }
}

export function setupNotificationListeners(navigation) {
  if (!messaging) return;

  // Foreground messages
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification:', remoteMessage);

    const { title, body } = remoteMessage.notification || {};
    const data = remoteMessage.data || {};

    // Refresh notifications & unread count
    store.dispatch(fetchNotifications());
    store.dispatch(fetchUnreadCount());

    // If signal-related, refresh signals list
    if (data.type === 'signal_new' || data.type === 'signal_closed') {
      store.dispatch(fetchSignals());
    }

      // Show in-app alert for foreground
      if (title && body) {
        Alert.alert(title, body, [
          { text: 'OK', onPress: () => {
            if (data.signal_id && navigation) {
              navigation.navigate('Markets', { screen: 'SignalDetail', params: { signalId: data.signal_id } });
            } else if (navigation) {
              navigation.navigate('Markets');
            }
          }},
        ]);
      }
    });

    // Background/quit tap handler
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened:', remoteMessage);
      const data = remoteMessage.data || {};

      if (data.signal_id && navigation) {
        navigation.navigate('Markets', { screen: 'SignalDetail', params: { signalId: data.signal_id } });
      } else if (navigation) {
        navigation.navigate('Markets');
      }
    });

    // Quit state tap handler
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Quit state notification:', remoteMessage);
        const data = remoteMessage.data || {};
        setTimeout(() => {
          if (data.signal_id && navigation) {
            navigation.navigate('Markets', { screen: 'SignalDetail', params: { signalId: data.signal_id } });
          } else if (navigation) {
            navigation.navigate('Markets');
          }
        }, 2000);
      }
    });

  // Token refresh
  messaging().onTokenRefresh(async newToken => {
    try {
      await client.post('/device/register', {
        fcm_token: newToken,
        platform: Platform.OS,
        device_name: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
        os_version: Platform.Version.toString(),
      });
    } catch (e) {
      console.log('Token refresh registration error:', e);
    }
  });
}
