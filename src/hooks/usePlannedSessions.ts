import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlannedSession, PlannedSessionStatus, SessionType } from '../types';
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
} from '../api/plannedSessions';
import { monthRange } from '../utils/date';

export function usePlannedSessions(notify: (message: string) => void) {
  const [sessions, setSessions] = useState<PlannedSession[]>([]);
  const [types, setTypes] = useState<SessionType[]>([]);
  const [range, setRange] = useState(() => monthRange(new Date()));
  const [ready, setReady] = useState(false);

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
  const rangeKey = `${range.from}:${range.to}`;
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

  const addSession = useCallback(
    async (input: { date: string; time?: string; sessionTypeId: number; notes?: string }) => {
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
    async (id: number, patch: { sessionTypeId: number; notes?: string }) => {
      const prevSessions = sessions;
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
      const updated = await updatePlannedSession(id, patch);
      if (!updated) {
        setSessions(prevSessions);
        notify('Änderung konnte nicht gespeichert werden');
        return null;
      }
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    [sessions, notify],
  );

  const reschedule = useCallback(
    async (id: number, date: string, time?: string) => {
      const prevSessions = sessions;
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, date, time } : s)));
      const updated = await reschedulePlannedSession(id, { date, time });
      if (!updated) {
        setSessions(prevSessions);
        notify('Verschieben fehlgeschlagen');
        return null;
      }
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    [sessions, notify],
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
    async (id: number) => {
      const prevSessions = sessions;
      setSessions((prev) => prev.filter((s) => s.id !== id));
      const ok = await deletePlannedSession(id);
      if (!ok) {
        setSessions(prevSessions);
        notify('Löschen fehlgeschlagen');
        return false;
      }
      return true;
    },
    [sessions, notify],
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
    addSession,
    updateSession,
    reschedule,
    markStatus,
    removeSession,
    addSessionType,
    removeSessionType,
  };
}

export type PlannedSessionsState = ReturnType<typeof usePlannedSessions>;
