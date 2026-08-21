import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStore';
import { refresh as refreshTokens } from '../auth/authClient';

const DEFAULT_API_BASE = 'http://localhost:8080/api';

/**
 * `window.API_BASE`, set via an inline script before the bundle loads, lets a static deploy
 * point at its backend without a rebuild — see docs/BACKEND.md.
 */
export function apiBase(): string {
  return window.API_BASE || import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
}

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

/** Shared low-level fetch: attaches the bearer token and retries once after a 401 refresh. */
export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
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
