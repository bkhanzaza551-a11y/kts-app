import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AiChatScreen from '../screens/ai/AiChatScreen';
import SupportChatScreen from '../screens/support/SupportChatScreen';

const Stack = createNativeStackNavigator();

export const AiChatNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AiChat" component={AiChatScreen} />
    <Stack.Screen name="SupportChat" component={SupportChatScreen} />
  </Stack.Navigator>
);
