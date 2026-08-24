import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaymentPlansScreen } from '../screens/payments/PaymentPlansScreen';
import { CheckoutScreen } from '../screens/payments/CheckoutScreen';
import { PaymentSuccessScreen } from '../screens/payments/PaymentSuccessScreen';
import { PaymentHistoryScreen } from '../screens/payments/PaymentHistoryScreen';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';

const Stack = createNativeStackNavigator();

export const PaymentNavigator = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.darkCard },
    headerTintColor: COLORS.white,
    headerTitleStyle: { ...TYPOGRAPHY.h4 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: COLORS.black },
  }}>
    <Stack.Screen name="Plans" component={PaymentPlansScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
    <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ headerShown: false }} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Payment History' }} />
  </Stack.Navigator>
);
