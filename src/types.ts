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

export interface Day {
  id: string;
  short: string;
  slot: Slot;
  title: string;
  blocks: Block[];
}

export interface Plan {
  warmup: string[];
  days: Day[];
}

/** Values logged for one exercise, keyed by side; each array is indexed by set number. */
export type SessionValues = Partial<Record<Side, string[]>>;

/** One logged workout: what was entered on `date` against the plan `dayId`. */
export interface WorkoutLog {
  date: string;
  dayId: string;
  vals: Record<string, SessionValues>;
  warm: boolean[];
}

export interface AppState {
  plan: Plan;
  logs: WorkoutLog[];
}

/** Identifies one block within the plan: the block at `index` on `dayId`. */
export interface BlockRef {
  dayId: string;
  index: number;
}

export type Mode = 'log' | 'edit';

export type PlannedSessionStatus = 'planned' | 'done' | 'skipped';

export interface SessionType {
  id: number;
  label: string;
  color?: string;
  icon?: string;
  /** True = user-created and deletable; false = seeded default, shared by every account. */
  custom: boolean;
}

export interface PlannedSession {
  id: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  sessionTypeId: number;
  dayId?: string; // optional link to a structured plan Day, chosen when scheduling
  status: PlannedSessionStatus;
  notes?: string;
  /** Set when this session is one occurrence of a series; drives the "nur dieser Termin?" prompt. */
  ruleId?: number;
}

/** Weekday bits in a weekly rule's mask: Mo=1, Di=2, Mi=4, Do=8, Fr=16, Sa=32, So=64. */
export type WeekdayMask = number;

export type RecurrencePattern = 'weekly' | 'interval';

export interface RecurringRule {
  id: number;
  sessionTypeId: number;
  dayId?: string;
  time?: string;
  notes?: string;
  pattern: RecurrencePattern;
  weekdays?: WeekdayMask;
  intervalDays?: number;
  startDate: string;
  endDate?: string;
}

/** Everything needed to create a recurring rule; the id is assigned by the backend. */
export type NewRecurringRule = Omit<RecurringRule, 'id'>;

/** Which occurrences an edit to a series applies to. */
export type EditScope = 'one' | 'future';
