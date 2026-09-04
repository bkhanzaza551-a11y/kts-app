import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BotListScreen } from '../screens/bots/BotListScreen';
import { BotDetailScreen } from '../screens/bots/BotDetailScreen';
import { BotTradesScreen } from '../screens/bots/BotTradesScreen';
import { BotPurchaseScreen } from '../screens/bots/BotPurchaseScreen';
import { DemoAccountScreen } from '../screens/demo/DemoAccountScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const Stack = createNativeStackNavigator();

export const BotNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.darkCard },
    headerTintColor: COLORS.white,
    headerTitleStyle: { ...TYPOGRAPHY.h4 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: COLORS.black },
  }}>
    <Stack.Screen name="BotList" component={BotListScreen} options={{ headerShown: false }} />
    <Stack.Screen name="BotDetail" component={BotDetailScreen} options={{ title: 'Bot Detail' }} />
    <Stack.Screen name="BotTrades" component={BotTradesScreen} options={{ title: 'Trade History' }} />
    <Stack.Screen name="BotPurchase" component={BotPurchaseScreen} options={{ title: 'Purchase Bot' }} />
    <Stack.Screen name="Demo" component={DemoAccountScreen} options={{ title: 'Demo Account' }} />
  </Stack.Navigator>
);
