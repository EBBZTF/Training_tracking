import type { EditScope, PlannedSession, PlannedSessionStatus } from '../types';
import { NO_CONTENT, request, requestOk, type NoContent } from './base';

/**
 * A scope=future write answers 204: the change applied to every later occurrence of the series, so
 * there is no single session to return and the caller has to reload the visible range.
 */
export const SERIES_CHANGED = NO_CONTENT;
export type SeriesChanged = NoContent;

export function loadPlannedSessions(from: string, to: string): Promise<PlannedSession[] | null> {
  const query = new URLSearchParams({ from, to });
  return request<PlannedSession[]>(`/planned-sessions?${query}`);
}

export function createPlannedSession(input: {
  date: string;
  time?: string;
  sessionTypeId: number;
  dayId?: string;
  notes?: string;
}): Promise<PlannedSession | null> {
  return request<PlannedSession>('/planned-sessions', { method: 'POST', body: input });
}

export function updatePlannedSession(
  id: number,
  patch: { sessionTypeId: number; dayId?: string; notes?: string; scope?: EditScope },
): Promise<PlannedSession | SeriesChanged | null> {
  return request<PlannedSession | SeriesChanged>(`/planned-sessions/${id}`, {
    method: 'PUT',
    body: patch,
  });
}

export function reschedulePlannedSession(
  id: number,
  patch: { date: string; time?: string; scope?: EditScope },
): Promise<PlannedSession | SeriesChanged | null> {
  return request<PlannedSession | SeriesChanged>(`/planned-sessions/${id}/schedule`, {
    method: 'PUT',
    body: patch,
  });
}

export function updatePlannedSessionStatus(
  id: number,
  status: PlannedSessionStatus,
): Promise<PlannedSession | null> {
  return request<PlannedSession>(`/planned-sessions/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function deletePlannedSession(id: number, scope?: EditScope): Promise<boolean> {
  const query = scope ? `?${new URLSearchParams({ scope })}` : '';
  return requestOk(`/planned-sessions/${id}${query}`, { method: 'DELETE' });
}
