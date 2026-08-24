import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatRoomListScreen } from '../screens/chat/ChatRoomListScreen';
import { ChatMessageScreen } from '../screens/chat/ChatMessageScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const Stack = createNativeStackNavigator();

export const ChatNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.darkCard },
    headerTintColor: COLORS.white,
    headerTitleStyle: { ...TYPOGRAPHY.h4 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: COLORS.black },
  }}>
    <Stack.Screen name="ChatRooms" component={ChatRoomListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ChatMessages" component={ChatMessageScreen} options={({ route }) => ({ title: route.params?.roomName || 'Chat' })} />
  </Stack.Navigator>
);
