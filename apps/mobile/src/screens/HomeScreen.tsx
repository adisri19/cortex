import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSDUI } from '../hooks/useSDUI';
import { useTheme, ThemeProvider } from '../context/ThemeContext';
import { resolveComponent } from '../registry/ComponentRegistry';
import CartBadge from '../components/common/CartBadge';
import FullScreenOverlay from '../components/blocks/FullScreenOverlay';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

const WelcomeBanner: React.FC<{ userName: string }> = React.memo(({ userName }) => {
  const theme = useTheme();

  const welcomeContainerStyle = useMemo(() => [
    styles.welcomeContainer
  ], []);

  const greetingStyle = useMemo(() => [
    styles.welcomeGreeting,
    { color: theme.text || '#1A1A1A' }
  ], [theme.text]);

  const nameStyle = useMemo(() => [
    styles.welcomeName,
    { color: theme.primary }
  ], [theme.primary]);

  return (
    <View style={welcomeContainerStyle}>
      <Text style={greetingStyle}>Hello parent,</Text>
      <Text style={nameStyle}>{userName} 👋</Text>
    </View>
  );
});

const Footer: React.FC = React.memo(() => {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        Delivering happiness in minutes 🌟
      </Text>
      <Text style={styles.footerSubText}>
        Kiddo App v1.0.0
      </Text>
    </View>
  );
});

const ScrollViewHorizontal: React.FC<{
  campaignId: string;
  label: string;
  activeId: string | null;
  onSelect: (id: string) => void;
  isActivating: boolean;
}> = React.memo(({ campaignId, label, activeId, onSelect, isActivating }) => {
  const theme = useTheme();
  const isActive = activeId === campaignId;

  const pillStyle = useMemo(() => [
    styles.pill,
    {
      backgroundColor: isActive ? theme.primary : '#ffffff',
      borderColor: theme.primary,
    }
  ], [isActive, theme.primary]);

  const pillTextStyle = useMemo(() => [
    styles.pillText,
    {
      color: isActive ? '#ffffff' : theme.text || '#1A1A1A',
    }
  ], [isActive, theme.text]);

  const activityColor = useMemo(() => isActive ? '#ffffff' : theme.primary, [isActive, theme.primary]);

  return (
    <TouchableOpacity
      style={pillStyle}
      onPress={() => onSelect(campaignId)}
      disabled={isActivating}
    >
      {isActivating ? (
        <ActivityIndicator size="small" color={activityColor} />
      ) : (
        <Text style={pillTextStyle}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { payload, isLoading, error, refetch } = useSDUI();
  const theme = useTheme();
  const [userName] = useState<string>('Aarav Sharma');
  const [isActivating, setIsActivating] = useState<string | null>(null);

  const handleActivateCampaign = useCallback(async (campaignId: string) => {
    setIsActivating(campaignId);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/activate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        console.log(`[Home] Campaign ${campaignId} activated successfully.`);
        refetch();
      }
    } catch (err) {
      console.error('[Home] failed to activate campaign:', err);
    } finally {
      setIsActivating(null);
    }
  }, [refetch]);

  const loadingStyle = useMemo(() => [
    styles.loading,
    { backgroundColor: theme.background }
  ], [theme.background]);

  const currentTheme = payload?.theme || theme;

  const safeAreaStyle = useMemo(() => [
    styles.safeArea,
    { backgroundColor: currentTheme.background }
  ], [currentTheme.background]);

  const logoStyle = useMemo(() => [
    styles.logo,
    { color: currentTheme.primary }
  ], [currentTheme.primary]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const Component = resolveComponent(item.type);
    if (!Component) return null;
    return <Component block={item} />;
  }, []);

  const renderWelcome = useCallback(() => {
    return <WelcomeBanner userName={userName} />;
  }, [userName]);

  const renderFooter = useCallback(() => {
    return <Footer />;
  }, []);

  if (isLoading && !payload) {
    return (
      <View style={loadingStyle}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!payload) return null;

  return (
    <ThemeProvider theme={currentTheme}>
      <SafeAreaView style={safeAreaStyle}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={logoStyle}>kiddo</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <CartBadge />
          </TouchableOpacity>
        </View>

        {/* Campaign Switcher */}
        <View style={styles.switcherContainer}>
          <ScrollViewHorizontal campaignId="back_to_school" label="School" activeId={payload.campaign} onSelect={handleActivateCampaign} isActivating={isActivating === 'back_to_school'} />
          <ScrollViewHorizontal campaignId="summer_playhouse" label="Playhouse" activeId={payload.campaign} onSelect={handleActivateCampaign} isActivating={isActivating === 'summer_playhouse'} />
          <ScrollViewHorizontal campaignId="mystery_carnival" label="Carnival" activeId={payload.campaign} onSelect={handleActivateCampaign} isActivating={isActivating === 'mystery_carnival'} />
        </View>

        {/* SDUI vertical FlashList */}
        <View style={styles.listWrapper}>
          <FlashList
            data={payload.blocks}
            keyExtractor={(item) => item.id}
            estimatedItemSize={220}
            drawDistance={600}
            onRefresh={refetch}
            refreshing={isLoading}
            renderItem={renderItem}
            ListHeaderComponent={renderWelcome}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Full Screen Overlay sibling */}
        <FullScreenOverlay block={payload.overlay} />
      </SafeAreaView>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'System',
    letterSpacing: -1,
  },
  switcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeGreeting: {
    fontSize: 14,
    opacity: 0.7,
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  footerContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  footerSubText: {
    fontSize: 10,
    color: '#b5b5b5',
    marginTop: 4,
  },
});

export default HomeScreen;
