import { useCallback, useEffect, useState } from 'react';
import type { AppState, BlockRef, Exercise, Mode, Side } from '../types';
import { attachDesc, defaultPlan } from '../data/defaultPlan';
import { loadState, saveState } from '../api/client';
import * as planOps from '../state/planOps';
import * as sessionOps from '../state/sessionOps';
import { isoDate } from '../utils/date';

export function useTrainingState(notify: (message: string) => void) {
  const [state, setState] = useState<AppState>(() => ({
    plan: attachDesc(defaultPlan()),
    logs: [],
  }));
  const [dayId, setDayId] = useState('mo');
  const [mode, setMode] = useState<Mode>('log');
  const [today, setToday] = useState(() => isoDate(new Date()));
  const [open, setOpen] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback(
    async (next: AppState) => {
      const ok = await saveState(next);
      if (!ok) notify('Speichern fehlgeschlagen');
    },
    [notify],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadState();
      if (cancelled) return;
      if (data && data.plan) {
        setState({ plan: attachDesc(data.plan), logs: data.logs });
      } else if (data) {
        // Brand-new user: no plan saved yet, seed the default one.
        const next = { plan: attachDesc(defaultPlan()), logs: data.logs };
        setState(next);
        void persist(next);
      } else {
        notify('Laden fehlgeschlagen — Backend erreichbar?');
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist]);

  const updatePlan = useCallback(
    (updater: (p: AppState['plan']) => AppState['plan']) => {
      setState((prev) => {
        const next = { ...prev, plan: updater(prev.plan) };
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const updateLogs = useCallback(
    (updater: (l: AppState['logs']) => AppState['logs']) => {
      setState((prev) => {
        const next = { ...prev, logs: updater(prev.logs) };
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const importState = useCallback(
    (data: AppState) => {
      const next = { plan: attachDesc(data.plan), logs: data.logs };
      setState(next);
      void persist(next);
    },
    [persist],
  );

  const resetPlan = useCallback(() => updatePlan(() => attachDesc(defaultPlan())), [updatePlan]);

  const addExercise = useCallback(
    (ref: BlockRef) => updatePlan((p) => planOps.addExercise(p, ref)),
    [updatePlan],
  );
  const addBlock = useCallback(
    (forDayId: string) => updatePlan((p) => planOps.addBlockToDay(p, forDayId)),
    [updatePlan],
  );
  const deleteExercise = useCallback(
    (ref: BlockRef, exId: string) => updatePlan((p) => planOps.deleteExercise(p, ref, exId)),
    [updatePlan],
  );
  const moveExercise = useCallback(
    (ref: BlockRef, exId: string, dir: -1 | 1) =>
      updatePlan((p) => planOps.moveExercise(p, ref, exId, dir)),
    [updatePlan],
  );
  const setExerciseUni = useCallback(
    (ref: BlockRef, exId: string, uni: boolean) =>
      updatePlan((p) => planOps.setExerciseUni(p, ref, exId, uni)),
    [updatePlan],
  );
  const setExerciseType = useCallback(
    (ref: BlockRef, exId: string, type: Exercise['type']) =>
      updatePlan((p) => planOps.setExerciseType(p, ref, exId, type)),
    [updatePlan],
  );
  const setExerciseText = useCallback(
    (ref: BlockRef, exId: string, field: 'name' | 'reps' | 'note' | 'desc', value: string) =>
      updatePlan((p) => planOps.setExerciseText(p, ref, exId, field, value)),
    [updatePlan],
  );
  const setExerciseSets = useCallback(
    (ref: BlockRef, exId: string, field: 'sets' | 'setsL' | 'setsR', value: number) =>
      updatePlan((p) => planOps.setExerciseSets(p, ref, exId, field, value)),
    [updatePlan],
  );
  const addWarmupItem = useCallback(
    () => updatePlan((p) => planOps.addWarmupItem(p)),
    [updatePlan],
  );
  const deleteWarmupItem = useCallback(
    (index: number) => updatePlan((p) => planOps.deleteWarmupItem(p, index)),
    [updatePlan],
  );
  const moveWarmupItem = useCallback(
    (index: number, dir: -1 | 1) => updatePlan((p) => planOps.moveWarmupItem(p, index, dir)),
    [updatePlan],
  );
  const setWarmupText = useCallback(
    (index: number, value: string) => updatePlan((p) => planOps.setWarmupText(p, index, value)),
    [updatePlan],
  );

  const setVal = useCallback(
    (exId: string, side: Side, i: number, value: string) =>
      updateLogs((l) => sessionOps.setVal(l, today, dayId, exId, side, i, value)),
    [updateLogs, today, dayId],
  );
  const toggleWarmupItem = useCallback(
    (index: number) => updateLogs((l) => sessionOps.toggleWarmup(l, today, dayId, index)),
    [updateLogs, today, dayId],
  );

  const getVal = useCallback(
    (exId: string, side: Side, i: number) =>
      sessionOps.getVal(state.logs, today, dayId, exId, side, i),
    [state.logs, today, dayId],
  );
  const lastVal = useCallback(
    (exId: string, side: Side, i: number) => sessionOps.lastVal(state.logs, today, exId, side, i),
    [state.logs, today],
  );

  const day = planOps.curDay(state.plan, dayId);
  const session = sessionOps.findSession(state.logs, today, dayId);

  return {
    plan: state.plan,
    logs: state.logs,
    dayId,
    mode,
    today,
    open,
    ready,
    day,
    session,
    blocks: planOps.allBlocksForDay(state.plan, day),
    findExercise: (id: string) => planOps.findExercise(state.plan, id),
    setDayId,
    setMode,
    setToday,
    setOpen,
    getVal,
    lastVal,
    setVal,
    toggleWarmupItem,
    addExercise,
    addBlock,
    deleteExercise,
    moveExercise,
    setExerciseUni,
    setExerciseType,
    setExerciseText,
    setExerciseSets,
    addWarmupItem,
    deleteWarmupItem,
    moveWarmupItem,
    setWarmupText,
    resetPlan,
    importState,
  };
}

export type TrainingState = ReturnType<typeof useTrainingState>;
