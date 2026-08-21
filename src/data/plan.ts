import type { Block, Exercise, Plan } from '../types';
import { DESC } from './descriptions';

export const uid = (): string => Math.random().toString(36).slice(2, 9);

/** Ein frisch angelegtes Konto startet leer — die Pläne baut sich jede Nutzerin selbst. */
export function emptyPlan(): Plan {
  return { warmup: [], days: [] };
}

/** Ergänzt Übungen um ihre Anleitung, sofern eine unter ihrem Namen hinterlegt ist. */
export function attachDesc(plan: Plan): Plan {
  const all: Block[] = [...(plan.hip ? [plan.hip] : []), ...plan.days.flatMap((d) => d.blocks)];
  all.forEach((b) =>
    b.ex.forEach((x: Exercise) => {
      if (!x.desc && DESC[x.name]) x.desc = DESC[x.name];
    }),
  );
  return plan;
}
