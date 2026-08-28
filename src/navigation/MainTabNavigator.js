import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeNavigator } from './HomeNavigator';
import { COLORS } from '../theme/colors';
import { SignalNavigator } from './SignalNavigator';
import { ChatNavigator } from './ChatNavigator';
import { BotNavigator } from './BotNavigator';
import { MoreNavigator } from './MoreNavigator';
import { AiChatNavigator } from './AiChatNavigator';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: Platform.OS === 'android' ? 8 : 12 }}>
    <Icon 
      name={name} 
      size={24} 
      color={focused ? '#FFD700' : '#888888'} 
    />
  </View>
);

export const MainTabNavigator = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#0B0E11', // Deep Binance dark
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      height: Platform.OS === 'ios' ? 85 : 65,
      paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    },
    tabBarActiveTintColor: '#FFD700',
    tabBarInactiveTintColor: '#888888',
    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 },
  }}>
    <Tab.Screen name="Home" component={HomeNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
    }} />
    <Tab.Screen name="Markets" component={SignalNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'poll' : 'poll'} focused={focused} />,
    }} />
    <Tab.Screen name="Chat" component={ChatNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'chat-processing' : 'chat-processing-outline'} focused={focused} />,
    }} />
    <Tab.Screen name="AI" component={AiChatNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'robot-excited' : 'robot-outline'} focused={focused} />,
    }} />
    <Tab.Screen name="Bots" component={BotNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'lightning-bolt' : 'lightning-bolt-outline'} focused={focused} />,
    }} />
    <Tab.Screen name="More" component={MoreNavigator} options={{
      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'view-grid' : 'view-grid-outline'} focused={focused} />,
    }} />
  </Tab.Navigator>
);
