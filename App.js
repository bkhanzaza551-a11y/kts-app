import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';
import { setLogoutCallback } from './src/api/client';
import { logout } from './src/store/authSlice';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    setLogoutCallback(() => dispatch(logout()));
    return () => setLogoutCallback(null);
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Provider store={store}>
            <CurrencyProvider>
              <AppContent />
            </CurrencyProvider>
          </Provider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
