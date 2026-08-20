/** YYYY-MM-DD in lokaler Zeitzone (nicht UTC, wie es `toISOString()` allein liefern würde). */
export function isoDate(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
