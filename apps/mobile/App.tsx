import React, { useEffect, useState, Component } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { fetchToken } from './src/config/api';
import { hydrateCart } from './src/context/CartContext';

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('[AppErrorBoundary] caught error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5E6' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#D32F2F' }}>Application Error</Text>
          <Text style={{ marginTop: 15, fontSize: 16, fontFamily: 'monospace', color: '#1A1A1A', textAlign: 'center' }}>
            {(this.state.error as Error).message}
          </Text>
          <Text style={{ marginTop: 15, fontSize: 12, color: '#666666', fontFamily: 'monospace', textAlign: 'left', width: '100%', overflow: 'scroll' }}>
            {(this.state.error as Error).stack}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [isLargeWebScreen, setIsLargeWebScreen] = useState(
    Platform.OS === 'web' && Dimensions.get('window').width > 600
  );

  useEffect(() => {
    async function initApp() {
      await fetchToken();
      await hydrateCart();
      setInitialized(true);
    }
    initApp();

    if (Platform.OS !== 'web') return;
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsLargeWebScreen(window.width > 600);
    });
    return () => subscription.remove();
  }, []);

  const appContent = !initialized ? (
    <View style={styles.loadingInner}>
      <ActivityIndicator size="large" color="#FF9933" />
    </View>
  ) : (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );

  if (isLargeWebScreen) {
    return (
      <AppErrorBoundary>
        <View style={styles.webContainer}>
          <View style={styles.webGlow1} />
          <View style={styles.webGlow2} />
          
          <View style={styles.phoneFrame}>
            <View style={styles.notchContainer}>
              <View style={styles.notch} />
            </View>
            {appContent}
          </View>

          <View style={styles.desktopInfo}>
            <Text style={styles.desktopTitle}>Kiddo SDUI Simulator</Text>
            <Text style={styles.desktopDesc}>
              Personalized Q-Commerce & personal AI RAG assistant.
            </Text>
            <View style={styles.badgeRow}>
              <Text style={styles.infoBadge}>React Native Web</Text>
              <Text style={styles.infoBadge}>FastAPI RAG</Text>
              <Text style={styles.infoBadge}>Express SDUI</Text>
            </View>
          </View>
        </View>
      </AppErrorBoundary>
    );
  }

  // Normal full-screen render on real phones or emulator screens
  return (
    <AppErrorBoundary>
      {appContent}
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0A0A12',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
  },
  webGlow1: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: '#FF9933',
    opacity: 0.1,
    top: '10%',
    left: '20%',
    ...Platform.select({
      web: {
        filter: 'blur(100px)',
      } as any,
    }),
  },
  webGlow2: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#8A2BE2',
    opacity: 0.08,
    bottom: '10%',
    right: '20%',
    ...Platform.select({
      web: {
        filter: 'blur(120px)',
      } as any,
    }),
  },
  phoneFrame: {
    width: 393,
    height: 852,
    maxHeight: '90vh',
    borderRadius: 48,
    borderWidth: 8,
    borderColor: '#1C1C24',
    backgroundColor: '#FFF5E6',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      } as any,
    }),
  },
  notchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  notch: {
    width: 110,
    height: 18,
    backgroundColor: '#1C1C24',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  loadingInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5E6',
  },
  desktopInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  desktopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  desktopDesc: {
    fontSize: 12,
    color: '#8A8A9E',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#1E1E2E',
    color: '#FF9933',
    fontSize: 9,
    fontWeight: '600',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#303046',
  },
});
