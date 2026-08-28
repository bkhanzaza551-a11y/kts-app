import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MarketDetailScreen } from '../screens/home/MarketDetailScreen';

const Stack = createNativeStackNavigator();

export const HomeNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0E11' } }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="MarketDetail" component={MarketDetailScreen} />
  </Stack.Navigator>
);
