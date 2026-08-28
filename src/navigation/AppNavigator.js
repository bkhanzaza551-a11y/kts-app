import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { storage } from '../utils/storage';
import { setToken, setUser } from '../store/authSlice';

export const AppNavigator = () => {
  const [isReady, setIsReady] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isLoggedIn } = useSelector(s => s.auth);
  const dispatch = useDispatch();

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

  if (isReady) return <SplashScreen />;

  return (
    <NavigationContainer>
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
