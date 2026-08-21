import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  EditScope,
  PlannedSession,
  PlannedSessionStatus,
  RecurringRule,
  SessionType,
} from '../types';
import {
  loadSessionTypes,
  createSessionType,
  deleteSessionType,
  loadPlannedSessions,
  createPlannedSession,
  updatePlannedSession,
  reschedulePlannedSession,
  updatePlannedSessionStatus,
  deletePlannedSession,
  SERIES_CHANGED,
} from '../api/plannedSessions';
import { createRecurringRule } from '../api/recurringRules';
import { monthRange } from '../utils/date';

export function usePlannedSessions(notify: (message: string) => void) {
  const [sessions, setSessions] = useState<PlannedSession[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  const [range, setRange] = useState(() => monthRange(new Date()));
  const [ready, setReady] = useState(false);
  /** Bumped to refetch the visible range after a change that touched a whole series. */
  const [reloadNonce, setReloadNonce] = useState(0);

  // Loaded once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadSessionTypes();
      if (cancelled) return;
      if (data) setTypes(data);
      else notify('Kategorien konnten nicht geladen werden');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reloaded whenever the visible range changes.
  const rangeKey = `${range.from}:${range.to}:${reloadNonce}`;
  const reloadToken = useRef(0);
  useEffect(() => {
    const token = ++reloadToken.current;
    let cancelled = false;
    (async () => {
      const data = await loadPlannedSessions(range.from, range.to);
      if (cancelled || token !== reloadToken.current) return;
      if (data) setSessions(data);
      else notify('Termine konnten nicht geladen werden');
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  const setVisibleRange = useCallback((from: string, to: string) => {
    setRange((prev) => (prev.from === from && prev.to === to ? prev : { from, to }));
  }, []);

  const reload = useCallback(() => setReloadNonce((n) => n + 1), []);

  const addSession = useCallback(
    async (input: {
      date: string;
      time?: string;
      sessionTypeId: number;
      dayId?: string;
      notes?: string;
    }) => {
      const created = await createPlannedSession(input);
      if (!created) {
        notify('Termin konnte nicht angelegt werden');
        return null;
      }
      setSessions((prev) => [...prev, created]);
      return created;
    },
    [notify],
  );

  const updateSession = useCallback(
    async (
      id: number,
      patch: { sessionTypeId: number; dayId?: string; notes?: string },
      scope: EditScope = 'one',
    ) => {
      const prevSessions = sessions;
      if (scope === 'one') {
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      }
      const updated = await updatePlannedSession(id, { ...patch, scope });
      if (!updated) {
        setSessions(prevSessions);
        notify('Änderung konnte nicht gespeichert werden');
        return null;
      }
      if (updated === SERIES_CHANGED) {
        reload();
        return SERIES_CHANGED;
      }
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    [sessions, notify, reload],
  );

  const reschedule = useCallback(
    async (id: number, date: string, time?: string, scope: EditScope = 'one') => {
      const prevSessions = sessions;
      if (scope === 'one') {
        setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, date, time } : s)));
      }
      const updated = await reschedulePlannedSession(id, { date, time, scope });
      if (!updated) {
        setSessions(prevSessions);
        notify('Verschieben fehlgeschlagen');
        return null;
      }
      if (updated === SERIES_CHANGED) {
        reload();
        return SERIES_CHANGED;
      }
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    [sessions, notify, reload],
  );

  const markStatus = useCallback(
    async (id: number, status: PlannedSessionStatus) => {
      const prevSessions = sessions;
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      const updated = await updatePlannedSessionStatus(id, status);
      if (!updated) {
        setSessions(prevSessions);
        notify('Status konnte nicht gespeichert werden');
        return null;
      }
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    [sessions, notify],
  );

  const removeSession = useCallback(
    async (id: number, scope: EditScope = 'one') => {
      const prevSessions = sessions;
      setSessions((prev) => prev.filter((s) => s.id !== id));
      const ok = await deletePlannedSession(id, scope);
      if (!ok) {
        setSessions(prevSessions);
        notify('Löschen fehlgeschlagen');
        return false;
      }
      // Ending a series drops every later occurrence, not just the one we removed locally.
      if (scope === 'future') reload();
      return true;
    },
    [sessions, notify, reload],
  );

  const addRule = useCallback(
    async (input: {
      sessionTypeId: number;
      dayId?: string;
      time?: string;
      notes?: string;
      pattern: RecurringRule['pattern'];
      weekdays?: number;
      intervalDays?: number;
      startDate: string;
      endDate?: string;
    }) => {
      const created = await createRecurringRule(input);
      if (!created) {
        notify('Wiederholung konnte nicht angelegt werden');
        return null;
      }
      reload();
      return created;
    },
    [notify, reload],
  );

  const addSessionType = useCallback(
    async (input: { label: string; color?: string; icon?: string }) => {
      const created = await createSessionType(input);
      if (!created) {
        notify('Kategorie konnte nicht angelegt werden');
        return null;
      }
      setTypes((prev) => [...prev, created]);
      return created;
    },
    [notify],
  );

  const removeSessionType = useCallback(
    async (id: number) => {
      const prevTypes = types;
      setTypes((prev) => prev.filter((t) => t.id !== id));
      const ok = await deleteSessionType(id);
      if (!ok) {
        setTypes(prevTypes);
        notify('Kategorie konnte nicht gelöscht werden');
        return false;
      }
      return true;
    },
    [types, notify],
  );

  return {
    sessions,
    types,
    range,
    ready,
    setVisibleRange,
    reload,
    addSession,
    addRule,
    updateSession,
    reschedule,
    markStatus,
    removeSession,
    addSessionType,
    removeSessionType,
  };
}

export type PlannedSessionsState = ReturnType<typeof usePlannedSessions>;
