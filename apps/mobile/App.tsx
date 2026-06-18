import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchToken } from './src/config/api';
import { hydrateCart } from './src/context/CartContext';

export default function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initApp() {
      // 1. Fetch auth token for dummy user
      await fetchToken();
      // 2. Hydrate cart from database
      await hydrateCart();
      setInitialized(true);
    }
    initApp();
  }, []);

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF9933" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
  },
});
