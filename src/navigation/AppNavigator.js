import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { storage } from '../utils/storage';
import { setToken, setUser } from '../store/authSlice';
import { requestNotificationPermission, registerDeviceWithBackend, setupNotificationListeners } from '../services/pushNotification';

export const AppNavigator = () => {
  const [isReady, setIsReady] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isLoggedIn } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const onboarded = await storage.isOnboarded();
        setShowOnboarding(!onboarded);

        const token = await storage.getToken();
        const user = await storage.getUser();
        if (token && user) {
          dispatch(setToken(token));
          dispatch(setUser(user));
        }
      } catch (e) {
        setShowOnboarding(false);
      }
      setTimeout(() => setIsReady(false), 2000);
    };
    init();
  }, []);

  // Setup push notifications when logged in
  useEffect(() => {
    if (isLoggedIn) {
      requestNotificationPermission().then(granted => {
        if (granted) {
          registerDeviceWithBackend();
        }
      });
    }
  }, [isLoggedIn]);

  // Setup notification listeners
  useEffect(() => {
    const nav = navRef.current;
    if (nav && isLoggedIn) {
      setupNotificationListeners(nav);
    }
  }, [isLoggedIn]);

  if (isReady) return <SplashScreen />;

  return (
    <NavigationContainer ref={navRef}>
      {showOnboarding ? (
        <OnboardingNavigator onFinish={() => { setShowOnboarding(false); storage.setOnboarded(); }} />
      ) : isLoggedIn ? (
        <MainTabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
