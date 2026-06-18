import { useState, useEffect, useCallback } from 'react';
import { SDUIPayload } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../config/api';

const fallbackPayload: SDUIPayload = {
  theme: {
    primary: '#FF9933',
    background: '#FFF5E6',
    accent: '#FFCC99',
    text: '#1A1A1A',
  },
  campaign: null,
  overlay: null,
  blocks: [
    {
      type: 'BANNER_HERO',
      id: 'fallback_hero',
      image_url: 'https://picsum.photos/seed/fallback/800/400',
      title: 'Welcome to Kiddo',
      subtitle: 'Offline Mode: Best baby and kid essentials delivered fast.',
      action: { type: 'DEEP_LINK', payload: { url: '/home' } },
    },
  ],
};

export function useSDUI() {
  const [payload, setPayload] = useState<SDUIPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = useCallback(async (retriesLeft: number, delay: number): Promise<SDUIPayload> => {
    try {
      const res = await fetch(`${API_BASE_URL}/homepage`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.data || !data.data.theme || !Array.isArray(data.data.blocks)) {
        throw new Error('Invalid SDUI response schema');
      }

      return data.data as SDUIPayload;
    } catch (err: any) {
      if (retriesLeft > 0) {
        console.warn(`[SDUI Hook] Fetch failed, retrying in ${delay}ms... Error: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retriesLeft - 1, delay * 2);
      }
      throw err;
    }
  }, []);

  const loadSDUI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWithRetry(3, 1000); // 3 retries, starting with 1000ms delay
      setPayload(data);
    } catch (err: any) {
      console.error('[SDUI Hook] All retries failed. Falling back to local payload.', err);
      setError(err.message || 'Failed to load feed');
      setPayload(fallbackPayload);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithRetry]);

  useEffect(() => {
    loadSDUI();
  }, [loadSDUI]);

  return {
    payload,
    isLoading,
    error,
    refetch: loadSDUI,
  };
}
