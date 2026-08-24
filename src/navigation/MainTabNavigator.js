import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { SignalNavigator } from './SignalNavigator';
import { ChatNavigator } from './ChatNavigator';
import { BotNavigator } from './BotNavigator';
import { MoreNavigator } from './MoreNavigator';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

export const MainTabNavigator = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.darkCard,
      borderTopColor: COLORS.darkBorder,
      borderTopWidth: 1,
      height: 70,
      paddingBottom: 10,
      paddingTop: 8,
    },
    tabBarActiveTintColor: COLORS.gold,
    tabBarInactiveTintColor: COLORS.grey,
    tabBarLabelStyle: { ...TYPOGRAPHY.tabLabel, marginTop: 4 },
  }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{
      tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
    }} />
    <Tab.Screen name="Signals" component={SignalNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
    }} />
    <Tab.Screen name="Chat" component={ChatNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
      tabBarBadge: undefined,
    }} />
    <Tab.Screen name="Bots" component={BotNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} />,
    }} />
    <Tab.Screen name="More" component={MoreNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon icon="⋯" focused={focused} />,
    }} />
  </Tab.Navigator>
);
