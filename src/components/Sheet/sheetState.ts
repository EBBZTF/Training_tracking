import type { Day, ExerciseType, PlannedSession, Side } from '../../types';

/** Which sheet is open, and the subject it was opened for. */
export type SheetState =
  | { type: 'info'; exId: string }
  | { type: 'entry'; exId: string; side: Side; index: number; name: string; exType: ExerciseType }
  | { type: 'history' }
  | { type: 'data' }
  | { type: 'newPlan' }
  | { type: 'editPlan'; day: Day }
  | { type: 'addSession'; date: string }
  | { type: 'sessionDetail'; session: PlannedSession }
  | null;
