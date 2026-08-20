import type { AppState } from '../types';

const DEFAULT_API_BASE = 'http://localhost:8080/api';

/**
 * `window.API_BASE`, set via an inline script before the bundle loads, lets a static deploy
 * point at its backend without a rebuild — see docs/BACKEND.md.
 */
function apiBase(): string {
  return window.API_BASE || import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
}

export async function loadState(): Promise<AppState | null> {
  try {
    const res = await fetch(`${apiBase()}/state`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as AppState;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function saveState(data: AppState): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/state`, {
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
