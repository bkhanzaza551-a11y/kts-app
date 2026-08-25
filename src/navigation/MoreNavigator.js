import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { MoreScreen } from '../screens/more/MoreScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { EducationScreen } from '../screens/education/EducationScreen';
import { CourseDetailScreen } from '../screens/education/CourseDetailScreen';
import { DemoAccountScreen } from '../screens/demo/DemoAccountScreen';
import { PaymentPlansScreen } from '../screens/payments/PaymentPlansScreen';
import { PaymentHistoryScreen } from '../screens/payments/PaymentHistoryScreen';
import { LegalScreen } from '../screens/more/LegalScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { ChangeSecurityCodeScreen } from '../screens/profile/ChangeSecurityCodeScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.black },
  headerTintColor: COLORS.gold,
  headerTitleStyle: { ...TYPOGRAPHY.h4, color: COLORS.white },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.black },
};

export const MoreNavigator = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MoreHome" component={MoreScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Education" component={EducationScreen} options={{ title: 'Education' }} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Course Detail' }} />
    <Stack.Screen name="Demo" component={DemoAccountScreen} options={{ title: 'Demo Account' }} />
    <Stack.Screen name="Payments" component={PaymentPlansScreen} options={{ title: 'Plans' }} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Payment History' }} />
    <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Legal' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    <Stack.Screen name="ChangeSecurityCode" component={ChangeSecurityCodeScreen} options={{ title: 'Change Security Code' }} />
  </Stack.Navigator>
);
