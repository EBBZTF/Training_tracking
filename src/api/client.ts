import type { AppState } from '../types';
import { authorizedFetch } from './base';

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
