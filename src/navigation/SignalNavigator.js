import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignalListScreen } from '../screens/signals/SignalListScreen';
import { SignalDetailScreen } from '../screens/signals/SignalDetailScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const Stack = createNativeStackNavigator();

export const SignalNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerShown: true,
    headerStyle: { backgroundColor: COLORS.darkCard },
    headerTintColor: COLORS.white,
    headerTitleStyle: { ...TYPOGRAPHY.h4 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: COLORS.black },
  }}>
    <Stack.Screen name="SignalList" component={SignalListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignalDetail" component={SignalDetailScreen} options={{ title: 'Signal Detail' }} />
  </Stack.Navigator>
);
