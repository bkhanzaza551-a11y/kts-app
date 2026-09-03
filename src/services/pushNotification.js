import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { store } from '../store';
import { fetchNotifications, fetchUnreadCount } from '../store/notificationSlice';
import { fetchSignals } from '../store/signalSlice';
import client from '../api/client';

let messaging = null;

try {
  const fm = require('@react-native-firebase/messaging');
  messaging = fm.default || fm;
} catch (e) {
  console.log('[Push] Firebase Messaging not available:', e.message);
}

export async function requestNotificationPermission() {
  // Android 13+ needs runtime permission first
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'KTS Markets Notifications',
          message: 'KTS Markets needs notification permission to send you trading signals, alerts, and updates.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[Push] Android POST_NOTIFICATIONS denied');
        return false;
      }
    } catch (e) {
      console.log('[Push] Android permission error:', e);
    }
  }

  // Now request Firebase permission
  if (!messaging) {
    console.log('[Push] Firebase messaging not initialized');
    return false;
  }

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2;   // PROVISIONAL

    console.log('[Push] Permission status:', authStatus, 'enabled:', enabled);
    return enabled;
  } catch (e) {
    console.log('[Push] Firebase permission error:', e);
    return false;
  }
}

export async function getFCMToken() {
  if (!messaging) {
    console.log('[Push] No messaging instance');
    return null;
  }

  try {
    const token = await messaging().getToken();
    console.log('[Push] FCM Token:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  } catch (e) {
    console.log('[Push] FCM token error:', e);
    return null;
  }
}

export async function registerDeviceWithBackend() {
  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      console.log('[Push] No FCM token, skipping registration');
      return;
    }

    const res = await client.post('/device/register', {
      fcm_token: fcmToken,
      platform: Platform.OS,
      device_name: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
      os_version: Platform.Version.toString(),
    });

    console.log('[Push] Device registered successfully');
  } catch (e) {
    console.log('[Push] Device registration error:', e.message || e);
  }
}

export function setupNotificationListeners(navigation) {
  if (!messaging) {
    console.log('[Push] No messaging, skipping listeners');
    return;
  }

  console.log('[Push] Setting up notification listeners');

  // Foreground messages
  messaging().onMessage(async remoteMessage => {
    console.log('[Push] Foreground notification:', JSON.stringify(remoteMessage).substring(0, 200));

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
    console.log('[Push] Notification opened:', remoteMessage);
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
      console.log('[Push] Quit state notification:', remoteMessage);
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
    console.log('[Push] Token refreshed');
    try {
      await client.post('/device/register', {
        fcm_token: newToken,
        platform: Platform.OS,
        device_name: Platform.OS === 'android' ? 'Android Device' : 'iOS Device',
        os_version: Platform.Version.toString(),
      });
    } catch (e) {
      console.log('[Push] Token refresh error:', e);
    }
  });
}
