import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = ({ onFinish }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding">
      {(props) => <OnboardingScreen {...props} onFinish={onFinish} />}
    </Stack.Screen>
  </Stack.Navigator>
);
