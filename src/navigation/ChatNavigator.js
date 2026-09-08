import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatMessageScreen } from '../screens/chat/ChatMessageScreen';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();

export const ChatNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: COLORS.black },
  }}>
    <Stack.Screen 
      name="ChatMessages" 
      component={ChatMessageScreen} 
      initialParams={{ roomSlug: 'general', roomName: 'Global Chat' }} 
    />
  </Stack.Navigator>
);
