import type { BlockRef, ExerciseType, PlannedSession, Side } from '../types';

export interface ExerciseActions {
  addExercise: (ref: BlockRef) => void;
  deleteExercise: (ref: BlockRef, exId: string) => void;
  moveExercise: (ref: BlockRef, exId: string, dir: -1 | 1) => void;
  setUni: (ref: BlockRef, exId: string, uni: boolean) => void;
  setType: (ref: BlockRef, exId: string, type: ExerciseType) => void;
  setText: (
    ref: BlockRef,
    exId: string,
    field: 'name' | 'reps' | 'note' | 'desc',
    value: string,
  ) => void;
  setSets: (ref: BlockRef, exId: string, field: 'sets' | 'setsL' | 'setsR', value: number) => void;
}

export interface WarmupActions {
  addWarmupItem: () => void;
  deleteWarmupItem: (index: number) => void;
  moveWarmupItem: (index: number, dir: -1 | 1) => void;
  setWarmupText: (index: number, value: string) => void;
}

export type SheetState =
  | { type: 'info'; exId: string }
  | { type: 'entry'; exId: string; side: Side; index: number; name: string; exType: ExerciseType }
  | { type: 'history' }
  | { type: 'data' }
  | { type: 'addSession'; date: string }
  | { type: 'sessionDetail'; session: PlannedSession }
  | null;
