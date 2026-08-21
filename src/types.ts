export type ExerciseType = 'kg' | 'band' | 'sek' | 'bw' | 'cm' | 'm' | 'min';

export type BlockKind = 'huefte' | 'skill' | 'kraft' | 'explosiv' | 'core' | 'ausdauer';

export type Slot = 'morgens' | 'nachmittags';

export type Side = 'B' | 'L' | 'R';

interface ExerciseBase {
  id: string;
  name: string;
  type: ExerciseType;
  reps: string;
  note?: string;
  desc?: string;
}

export interface BilateralExercise extends ExerciseBase {
  uni: false;
  sets: number;
}

export interface UnilateralExercise extends ExerciseBase {
  uni: true;
  setsL: number;
  setsR: number;
}

export type Exercise = BilateralExercise | UnilateralExercise;

export interface Block {
  kind: BlockKind;
  name: string;
  ex: Exercise[];
}

/** A block as rendered for a given day: the hip block is shared across every day. */
export interface BlockView extends Block {
  shared?: boolean;
}

export interface Day {
  id: string;
  short: string;
  slot: Slot;
  title: string;
  blocks: Block[];
}

export interface Plan {
  warmup: string[];
  hip: Block;
  days: Day[];
}

/** Values logged for one exercise, keyed by side; each array is indexed by set number. */
export type SessionValues = Partial<Record<Side, string[]>>;

export interface Session {
  date: string;
  dayId: string;
  vals: Record<string, SessionValues>;
  warm: boolean[];
}

export interface AppState {
  plan: Plan;
  logs: Session[];
}

/** Identifies one block within the plan: either the shared hip block, or the block at `index` on `dayId`. */
export type BlockRef = { kind: 'hip' } | { kind: 'day'; dayId: string; index: number };

export type Mode = 'log' | 'edit';

export type PlannedSessionStatus = 'planned' | 'done' | 'skipped';

export interface SessionType {
  id: number;
  label: string;
  color?: string;
  icon?: string;
  custom: boolean; // true = user-created, false = seeded default (no delete/edit affordance for false)
}

export interface PlannedSession {
  id: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  sessionTypeId: number;
  dayId?: string; // optional link to a structured plan Day; not exposed in v1 UI
  status: PlannedSessionStatus;
  notes?: string;
}
