import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/store';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <CurrencyProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
          <AppNavigator />
        </CurrencyProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
