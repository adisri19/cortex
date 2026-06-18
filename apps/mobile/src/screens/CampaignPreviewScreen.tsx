import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

interface CampaignDemo {
  id: string;
  label: string;
  is_active: boolean;
  theme: {
    primary: string;
    background: string;
    accent: string;
    text: string;
  };
}

const CampaignCard: React.FC<{
  campaign: CampaignDemo;
  activeId: string | null;
  activatingId: string | null;
  onActivate: (campaignId: string) => void;
}> = React.memo(({ campaign, activeId, activatingId, onActivate }) => {
  const theme = useTheme();
  const isLive = campaign.is_active || activeId === campaign.id;

  const btnStyle = useMemo(() => [
    styles.activateBtn,
    {
      backgroundColor: isLive ? '#cccccc' : theme.primary,
    }
  ], [isLive, theme.primary]);

  const circle1Style = useMemo(() => [
    styles.colorCircle,
    { backgroundColor: campaign.theme.primary }
  ], [campaign.theme.primary]);

  const circle2Style = useMemo(() => [
    styles.colorCircle,
    { backgroundColor: campaign.theme.background }
  ], [campaign.theme.background]);

  const circle3Style = useMemo(() => [
    styles.colorCircle,
    { backgroundColor: campaign.theme.accent || '#eeeeee' }
  ], [campaign.theme.accent]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardLabel}>{campaign.label}</Text>
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardId}>Campaign ID: {campaign.id}</Text>

      {/* Colors Preview circles */}
      <View style={styles.paletteRow}>
        <View style={circle1Style} />
        <View style={circle2Style} />
        <View style={circle3Style} />
      </View>

      {/* Activate button */}
      <TouchableOpacity
        style={btnStyle}
        onPress={() => onActivate(campaign.id)}
        disabled={isLive || activatingId !== null}
      >
        {activatingId === campaign.id ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.activateText}>
            {isLive ? 'Currently Active' : 'Activate Campaign'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const CampaignPreviewScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const theme = useTheme();
  const [campaigns, setCampaigns] = useState<CampaignDemo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
        const active = data.campaigns.find((c: any) => c.is_active);
        if (active) {
          setActiveId(active.id);
        }
      }
    } catch (err) {
      console.error('[CampaignPreview] failed to query campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleActivate = useCallback(async (campaignId: string) => {
    setActivatingId(campaignId);
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/activate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveId(campaignId);
        setCampaigns((prev) =>
          prev.map((c) => ({
            ...c,
            is_active: c.id === campaignId,
          }))
        );
        Alert.alert('Success', 'Campaign activated — no app update needed!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Home');
            },
          },
        ]);
      }
    } catch (err) {
      console.error('[CampaignPreview] activation failed:', err);
      Alert.alert('Error', 'Failed to activate campaign.');
    } finally {
      setActivatingId(null);
    }
  }, [navigation]);

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.background }
  ], [theme.background]);

  const headerStyle = useMemo(() => [
    styles.header,
    { color: theme.primary }
  ], [theme.primary]);

  const loadingStyle = useMemo(() => [
    styles.loading,
    { backgroundColor: theme.background }
  ], [theme.background]);

  if (loading) {
    return (
      <View style={loadingStyle}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={containerStyle}>
      <Text style={headerStyle}>Live Campaign Engine</Text>
      <Text style={styles.desc}>
        Instantly push visual themes, overlay animations, and collection reorderings to all users in real-time.
      </Text>

      {campaigns.map((c) => (
        <CampaignCard
          key={c.id}
          campaign={c}
          activeId={activeId}
          activatingId={activatingId}
          onActivate={handleActivate}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 12,
  },
  desc: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardId: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 12,
  },
  paletteRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  activateBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activateText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default CampaignPreviewScreen;
