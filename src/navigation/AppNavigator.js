import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { storage } from '../utils/storage';

export const AppNavigator = () => {
  const [isReady, setIsReady] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isLoggedIn } = useSelector(s => s.auth);

  useEffect(() => {
    const init = async () => {
      const onboarded = await storage.isOnboarded();
      setShowOnboarding(!onboarded);
      setTimeout(() => setIsReady(false), 2000);
    };
    init();
  }, []);

  if (isReady) return     <SplashScreen />;

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
