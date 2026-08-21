import type {
  BilateralExercise,
  Block,
  BlockRef,
  BlockView,
  Day,
  Exercise,
  Plan,
  UnilateralExercise,
} from '../types';
import { uid } from '../data/defaultPlan';

function newExercise(): BilateralExercise {
  return { id: uid(), name: 'Neue Übung', type: 'kg', uni: false, sets: 3, reps: '8' };
}

export function curDay(plan: Plan, dayId: string): Day {
  return plan.days.find((d) => d.id === dayId) ?? plan.days[0];
}

export function allBlocksForDay(plan: Plan, day: Day): BlockView[] {
  return [{ ...plan.hip, shared: true }, ...day.blocks];
}

export function findExercise(plan: Plan, id: string): Exercise | null {
  for (const block of [plan.hip, ...plan.days.flatMap((d) => d.blocks)]) {
    const found = block.ex.find((x) => x.id === id);
    if (found) return found;
  }
  return null;
}

export function getBlock(plan: Plan, ref: BlockRef): Block {
  if (ref.kind === 'hip') return plan.hip;
  const day = plan.days.find((d) => d.id === ref.dayId);
  const block = day?.blocks[ref.index];
  if (!block) throw new Error(`Unknown block ${ref.index} on day ${ref.dayId}`);
  return block;
}

function withBlock(plan: Plan, ref: BlockRef, updater: (block: Block) => Block): Plan {
  if (ref.kind === 'hip') return { ...plan, hip: updater(plan.hip) };
  return {
    ...plan,
    days: plan.days.map((d) =>
      d.id === ref.dayId
        ? { ...d, blocks: d.blocks.map((b, i) => (i === ref.index ? updater(b) : b)) }
        : d,
    ),
  };
}

export function addExercise(plan: Plan, ref: BlockRef): Plan {
  return withBlock(plan, ref, (b) => ({ ...b, ex: [...b.ex, newExercise()] }));
}

export function addBlockToDay(plan: Plan, dayId: string): Plan {
  return {
    ...plan,
    days: plan.days.map((d) =>
      d.id === dayId
        ? {
            ...d,
            blocks: [...d.blocks, { kind: 'core', name: 'Neuer Block', ex: [newExercise()] }],
          }
        : d,
    ),
  };
}

export function deleteExercise(plan: Plan, ref: BlockRef, exId: string): Plan {
  return withBlock(plan, ref, (b) => ({ ...b, ex: b.ex.filter((x) => x.id !== exId) }));
}

export function moveExercise(plan: Plan, ref: BlockRef, exId: string, dir: -1 | 1): Plan {
  return withBlock(plan, ref, (b) => {
    const idx = b.ex.findIndex((x) => x.id === exId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= b.ex.length) return b;
    const ex = [...b.ex];
    const [item] = ex.splice(idx, 1);
    ex.splice(target, 0, item);
    return { ...b, ex };
  });
}

type ExerciseTextField = 'name' | 'reps' | 'note' | 'desc';

function convertUni(x: Exercise, uni: boolean): Exercise {
  if (x.uni === uni) return x;
  const { id, name, type, reps, note, desc } = x;
  const base = { id, name, type, reps, note, desc };
  if (uni) {
    const fallback = (x as BilateralExercise).sets || 3;
    return { ...base, uni: true, setsL: fallback, setsR: fallback };
  }
  const ux = x as UnilateralExercise;
  const fallback = Math.max(ux.setsL || 0, ux.setsR || 0) || 3;
  return { ...base, uni: false, sets: fallback };
}

export function setExerciseUni(plan: Plan, ref: BlockRef, exId: string, uni: boolean): Plan {
  return withBlock(plan, ref, (b) => ({
    ...b,
    ex: b.ex.map((x) => (x.id === exId ? convertUni(x, uni) : x)),
  }));
}

export function setExerciseType(
  plan: Plan,
  ref: BlockRef,
  exId: string,
  type: Exercise['type'],
): Plan {
  return withBlock(plan, ref, (b) => ({
    ...b,
    ex: b.ex.map((x) => (x.id === exId ? { ...x, type } : x)),
  }));
}

export function setExerciseText(
  plan: Plan,
  ref: BlockRef,
  exId: string,
  field: ExerciseTextField,
  value: string,
): Plan {
  return withBlock(plan, ref, (b) => ({
    ...b,
    ex: b.ex.map((x) => (x.id === exId ? { ...x, [field]: value } : x)),
  }));
}

export function setExerciseSets(
  plan: Plan,
  ref: BlockRef,
  exId: string,
  field: 'sets' | 'setsL' | 'setsR',
  value: number,
): Plan {
  const clamped = Math.max(0, value || 0);
  return withBlock(plan, ref, (b) => ({
    ...b,
    ex: b.ex.map((x) => (x.id === exId ? ({ ...x, [field]: clamped } as Exercise) : x)),
  }));
}

export function addWarmupItem(plan: Plan): Plan {
  return { ...plan, warmup: [...plan.warmup, 'Neuer Punkt'] };
}

export function deleteWarmupItem(plan: Plan, index: number): Plan {
  return { ...plan, warmup: plan.warmup.filter((_, i) => i !== index) };
}

export function moveWarmupItem(plan: Plan, index: number, dir: -1 | 1): Plan {
  const target = index + dir;
  if (target < 0 || target >= plan.warmup.length) return plan;
  const warmup = [...plan.warmup];
  const [item] = warmup.splice(index, 1);
  warmup.splice(target, 0, item);
  return { ...plan, warmup };
}

export function setWarmupText(plan: Plan, index: number, value: string): Plan {
  return { ...plan, warmup: plan.warmup.map((w, i) => (i === index ? value : w)) };
}
