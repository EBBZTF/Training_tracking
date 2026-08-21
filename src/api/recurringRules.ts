import type { RecurringRule } from '../types';
import { authorizedFetch } from './base';

/**
 * Creates a repeating slot. The occurrences it generates arrive through the normal planned-session
 * range fetch, so callers create a rule and then reload the visible range.
 */
export async function createRecurringRule(input: {
  sessionTypeId: number;
  dayId?: string;
  time?: string;
  notes?: string;
  pattern: RecurringRule['pattern'];
  weekdays?: number;
  intervalDays?: number;
  startDate: string;
  endDate?: string;
}): Promise<RecurringRule | null> {
  try {
    const res = await authorizedFetch('/recurring-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as RecurringRule;
  } catch (err) {
    console.error(err);
    return null;
  }
}
