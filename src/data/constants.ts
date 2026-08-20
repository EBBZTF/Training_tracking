import type { ExerciseType } from '../types';

export const UNIT: Record<ExerciseType, string> = {
  kg: 'kg',
  band: 'Band',
  sek: 'Sek',
  bw: 'Wdh',
  cm: 'cm',
  m: 'm',
  min: 'Min',
};

/** Types whose values are picked from a fixed word list instead of typed as a number. */
export const TEXTY: Partial<Record<ExerciseType, true>> = { band: true };

export const QUICK: Record<ExerciseType, (number | string)[]> = {
  kg: [2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 40],
  sek: [10, 15, 20, 30, 40, 45, 60],
  bw: [3, 5, 6, 8, 10, 12, 15, 20],
  cm: [20, 25, 30, 35, 40, 45, 50],
  m: [1.2, 1.4, 1.6, 1.8, 2.0],
  min: [15, 20, 25, 30],
  band: ['gelb', 'rot', 'grün', 'blau', 'schwarz'],
};

export const EXERCISE_TYPES: ExerciseType[] = ['kg', 'band', 'sek', 'bw', 'cm', 'm', 'min'];
