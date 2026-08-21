/** YYYY-MM-DD in lokaler Zeitzone (nicht UTC, wie es `toISOString()` allein liefern würde). */
export function isoDate(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/** Montag=0 … Sonntag=6, unabhängig von der Locale (`Date#getDay()` liefert Sonntag=0). */
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Neues Datum, `days` Tage nach `d` (negativ = davor), ohne `d` zu verändern. */
function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Erster Tag des 6×7-Rasters (montagsbeginnend) für den Monat, der `d` enthält. */
function gridStart(d: Date): Date {
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return addDays(firstOfMonth, -mondayIndex(firstOfMonth));
}

/** Die 42 Tage (6 Wochen × 7 Tage, montagsbeginnend) des Monatsrasters, das `d` enthält — inklusive Auffüll-Tagen aus Nachbarmonaten. */
export function monthGrid(d: Date): Date[] {
  const start = gridStart(d);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** `from`/`to`-Grenzen (YYYY-MM-DD) des kompletten 42-Tage-Rasters, nicht nur des strengen Kalendermonats. */
export function monthRange(d: Date): { from: string; to: string } {
  const grid = monthGrid(d);
  return { from: isoDate(grid[0]), to: isoDate(grid[grid.length - 1]) };
}

/** Neues Datum, `delta` Monate nach `d` versetzt (negativ = davor); Tag wird auf den 1. gesetzt. */
export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });

/** z.B. "August 2026". */
export function formatMonthLabel(d: Date): string {
  return MONTH_LABEL_FORMAT.format(d);
}
