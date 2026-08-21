-- A series pinned exactly one workout plan, so "Montags Beine, Donnerstags Arme" needed two
-- separate series and a rotating A/B/C split could not be expressed at all. The rhythm (`pattern`)
-- keeps answering *when* the series generates a date; *which* plan lands on that date is now its own
-- question, answered by `plan_mode`:
--   'fixed'    -> recurring_rules.day_key, exactly as before — the default, so existing rows are done
--   'weekday'  -> recurring_rule_plans keyed by weekday index (0=Mo … 6=So); a scheduled weekday
--                 with no row generates its occurrence without a plan
--   'rotation' -> recurring_rule_plans keyed by cycle position 0..n-1, advancing one step per
--                 generated date, so a 3-plan cycle brings each plan back every third session
ALTER TABLE recurring_rules
    ADD COLUMN plan_mode VARCHAR(16) NOT NULL DEFAULT 'fixed'
        CHECK (plan_mode IN ('fixed', 'weekday', 'rotation')),
    -- Which cycle step the rule's own start_date sits on. Splitting a series — a move, an edit
    -- "ab hier", or carrying a missed plan over — creates a rule that starts mid-cycle; without
    -- this the new half would restart at the first plan of the rotation.
    ADD COLUMN rotation_offset SMALLINT NOT NULL DEFAULT 0 CHECK (rotation_offset >= 0);

-- Weekday assignment only means something for a rule that picks its dates by weekday.
ALTER TABLE recurring_rules ADD CONSTRAINT recurring_rules_weekday_plans_need_weekly
    CHECK (plan_mode <> 'weekday' OR pattern = 'weekly');

-- position is a weekday index for plan_mode='weekday' and a cycle step for 'rotation'; both stay
-- well under the upper bound, which is only here to keep a stray request from writing a huge cycle.
CREATE TABLE recurring_rule_plans (
    rule_id  BIGINT      NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
    position SMALLINT    NOT NULL CHECK (position BETWEEN 0 AND 11),
    day_key  VARCHAR(16) NOT NULL,
    PRIMARY KEY (rule_id, position)
);
