-- Every "alle künftigen Termine" edit splits a series into two rule rows (V4), but nothing tied the
-- halves together. An edit on an earlier half therefore produced a rule that overlapped its own
-- successors — two sessions on every date from the older split onwards — and "ab hier" could never
-- reach past the next split point, so a series could not be switched to per-weekday or rotating
-- plans once it had been edited at all.
--
-- series_id names the chain: the id of the rule the series started as. NULL means the rule is the
-- head of its own chain, which is what every rule was before this column existed. Halves that were
-- already split apart by then stay separate series — nothing recorded what they belonged to. No FK:
-- the head row can legitimately be deleted (ending a series) while later halves live on.
ALTER TABLE recurring_rules ADD COLUMN series_id BIGINT;

CREATE INDEX idx_recurring_rules_series ON recurring_rules(series_id);
