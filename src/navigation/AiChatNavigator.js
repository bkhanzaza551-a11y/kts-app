import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AiChatScreen from '../screens/ai/AiChatScreen';

const Stack = createNativeStackNavigator();

export const AiChatNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AiChat" component={AiChatScreen} />
  </Stack.Navigator>
);
