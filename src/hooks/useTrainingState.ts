import { useCallback, useEffect, useState } from 'react';
import type { AppState, BlockRef, Day, Exercise, Side, Slot } from '../types';
import { attachDesc, emptyPlan, uid } from '../data/plan';
import { loadState, saveState } from '../api/client';
import * as planOps from '../state/planOps';
import * as sessionOps from '../state/sessionOps';

/** Which day is being looked at: the date logs are written under, and the plan shown for it. */
export interface Selection {
  date: string;
  dayId: string;
}

/**
 * Plan and logs for the selected day. The selection itself is controlled by the caller, because in
 * log mode it follows what the calendar has scheduled and in edit mode it follows the plan list.
 */
export function useTrainingState(notify: (message: string) => void, selection: Selection) {
  const [state, setState] = useState<AppState>(() => ({
    plan: emptyPlan(),
    logs: [],
  }));
  const [open, setOpen] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { date: today, dayId } = selection;

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
        // Brand-new user: nothing saved yet. Stay empty and write nothing — the account only gets
        // a plan once she creates one, which is what the onboarding check keys off.
        setState({ plan: emptyPlan(), logs: data.logs });
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

  const resetPlan = useCallback(() => updatePlan(emptyPlan), [updatePlan]);

  const addExercise = useCallback(
    (ref: BlockRef) => updatePlan((p) => planOps.addExercise(p, ref)),
    [updatePlan],
  );
  const addBlock = useCallback(
    (forDayId: string) => updatePlan((p) => planOps.addBlockToDay(p, forDayId)),
    [updatePlan],
  );
  /** Returns the new plan so the caller can select it. */
  const addDay = useCallback(
    (input: { title: string; short: string; slot: Slot }) => {
      const day: Day = {
        id: uid(),
        short: input.short,
        slot: input.slot,
        title: input.title,
        blocks: [],
      };
      updatePlan((p) => planOps.addDay(p, day));
      return day;
    },
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
    today,
    open,
    ready,
    day,
    session,
    blocks: planOps.allBlocksForDay(state.plan, day),
    findExercise: (id: string) => planOps.findExercise(state.plan, id),
    setOpen,
    getVal,
    lastVal,
    setVal,
    toggleWarmupItem,
    addExercise,
    addBlock,
    addDay,
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
