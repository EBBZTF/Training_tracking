import type { NewRecurringRule, RecurringRule } from '../types';
import { request } from './base';

/**
 * Creates a repeating slot. The occurrences it generates arrive through the normal planned-session
 * range fetch, so callers create a rule and then reload the visible range.
 */
export function createRecurringRule(input: NewRecurringRule): Promise<RecurringRule | null> {
  return request<RecurringRule>('/recurring-rules', { method: 'POST', body: input });
}
