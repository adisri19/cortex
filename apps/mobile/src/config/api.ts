import { Platform } from 'react-native';

// Standard base URL. Android emulator uses 10.0.2.2 to access localhost of host machine.
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1',
  default: 'http://localhost:3000/api/v1',
});

export const AI_SERVICE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

let authToken = '';

export async function fetchToken(userId: string = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      authToken = data.token;
      return data.token;
    }
  } catch (err) {
    console.error('[API Config] Token fetch failed:', err);
  }
  return '';
}

export function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };
}

export function getToken() {
  return authToken;
}
