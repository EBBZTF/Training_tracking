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
