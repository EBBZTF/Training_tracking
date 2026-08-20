import type { Session, Side } from '../types';

export function findSession(logs: Session[], date: string, dayId: string): Session | undefined {
  return logs.find((s) => s.date === date && s.dayId === dayId);
}

export function getVal(
  logs: Session[],
  date: string,
  dayId: string,
  exId: string,
  side: Side,
  i: number,
): string {
  return findSession(logs, date, dayId)?.vals[exId]?.[side]?.[i] ?? '';
}

/** Letzter Eintrag für diese Position vor `beforeDate`, über alle protokollierten Einheiten hinweg. */
export function lastVal(
  logs: Session[],
  beforeDate: string,
  exId: string,
  side: Side,
  i: number,
): string {
  const prev = logs
    .filter((s) => {
      const v = s.vals[exId]?.[side]?.[i];
      return s.date < beforeDate && v !== undefined && v !== '';
    })
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return prev ? (prev.vals[exId][side]![i] ?? '') : '';
}

export function setVal(
  logs: Session[],
  date: string,
  dayId: string,
  exId: string,
  side: Side,
  i: number,
  value: string,
): Session[] {
  const existing = findSession(logs, date, dayId);
  const base: Session = existing ?? { date, dayId, vals: {}, warm: [] };
  const sideVals = [...(base.vals[exId]?.[side] ?? [])];
  sideVals[i] = value;
  const next: Session = {
    ...base,
    vals: { ...base.vals, [exId]: { ...base.vals[exId], [side]: sideVals } },
  };
  return existing ? logs.map((s) => (s === existing ? next : s)) : [...logs, next];
}

export function toggleWarmup(
  logs: Session[],
  date: string,
  dayId: string,
  index: number,
): Session[] {
  const existing = findSession(logs, date, dayId);
  const base: Session = existing ?? { date, dayId, vals: {}, warm: [] };
  const warm = [...base.warm];
  warm[index] = !warm[index];
  const next: Session = { ...base, warm };
  return existing ? logs.map((s) => (s === existing ? next : s)) : [...logs, next];
}
