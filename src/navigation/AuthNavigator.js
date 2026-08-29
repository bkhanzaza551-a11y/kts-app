import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { SecurityCodeScreen } from '../screens/auth/SecurityCodeScreen';
import { COLORS } from '../theme/colors';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: COLORS.black },
    animation: 'slide_from_right',
  }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    <Stack.Screen name="SecurityCode" component={SecurityCodeScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

