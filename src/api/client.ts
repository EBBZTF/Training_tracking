import type { AppState } from '../types';
import { apiBase } from './base';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStore';
import { refresh as refreshTokens } from '../auth/authClient';

let refreshInFlight: Promise<string | null> | null = null;

/** Coalesces concurrent 401s into a single refresh call instead of racing multiple rotations. */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const result = await refreshTokens(rt);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    return result.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (res.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set('Authorization', `Bearer ${refreshedToken}`);
      res = await fetch(`${apiBase()}${path}`, { ...init, headers });
    }
  }
  return res;
}

export async function loadState(): Promise<AppState | null> {
  try {
    const res = await authorizedFetch('/state');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as AppState;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function saveState(data: AppState): Promise<boolean> {
  try {
    const res = await authorizedFetch('/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
