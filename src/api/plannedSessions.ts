import type { EditScope, PlannedSession, PlannedSessionStatus, SessionType } from '../types';
import { authorizedFetch } from './base';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * A scope=future write answers 204: it changed every later occurrence of the series, so there is no
 * single session to return and the caller has to reload the visible range.
 */
export const SERIES_CHANGED = 'series-changed';
export type SeriesChanged = typeof SERIES_CHANGED;

export async function loadSessionTypes(): Promise<SessionType[] | null> {
  try {
    const res = await authorizedFetch('/session-types');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SessionType[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createSessionType(input: {
  label: string;
  color?: string;
  icon?: string;
}): Promise<SessionType | null> {
  try {
    const res = await authorizedFetch('/session-types', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SessionType;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function deleteSessionType(id: number): Promise<boolean> {
  try {
    const res = await authorizedFetch(`/session-types/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function loadPlannedSessions(
  from: string,
  to: string,
): Promise<PlannedSession[] | null> {
  try {
    const res = await authorizedFetch(
      `/planned-sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PlannedSession[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createPlannedSession(input: {
  date: string;
  time?: string;
  sessionTypeId: number;
  dayId?: string;
  notes?: string;
}): Promise<PlannedSession | null> {
  try {
    const res = await authorizedFetch('/planned-sessions', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PlannedSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updatePlannedSession(
  id: number,
  patch: { sessionTypeId: number; dayId?: string; notes?: string; scope?: EditScope },
): Promise<PlannedSession | SeriesChanged | null> {
  try {
    const res = await authorizedFetch(`/planned-sessions/${id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return SERIES_CHANGED;
    return (await res.json()) as PlannedSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function reschedulePlannedSession(
  id: number,
  patch: { date: string; time?: string; scope?: EditScope },
): Promise<PlannedSession | SeriesChanged | null> {
  try {
    const res = await authorizedFetch(`/planned-sessions/${id}/schedule`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return SERIES_CHANGED;
    return (await res.json()) as PlannedSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updatePlannedSessionStatus(
  id: number,
  status: PlannedSessionStatus,
): Promise<PlannedSession | null> {
  try {
    const res = await authorizedFetch(`/planned-sessions/${id}/status`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PlannedSession;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function deletePlannedSession(id: number, scope?: EditScope): Promise<boolean> {
  try {
    const query = scope ? `?scope=${scope}` : '';
    const res = await authorizedFetch(`/planned-sessions/${id}${query}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
