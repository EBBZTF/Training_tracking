-- planned_sessions.day_id referenced days(id), but PUT /api/state deletes and recreates every day
-- row on each plan save, so ON DELETE SET NULL silently dropped the link every time the user edited
-- an exercise. (user_id, day_key) is a plan's stable identity across those rewrites, so store that
-- instead and resolve it on read. A day_key that no longer resolves reads as "no plan linked".
ALTER TABLE planned_sessions ADD COLUMN day_key VARCHAR(16);
UPDATE planned_sessions ps SET day_key = d.day_key FROM days d WHERE d.id = ps.day_id;
ALTER TABLE planned_sessions DROP COLUMN day_id;

-- A repeating training slot. Two patterns, matching what the UI offers:
--   'weekly'   -> on the weekdays in the `weekdays` bitmask (Mo=1, Di=2, Mi=4, Do=8, Fr=16, Sa=32, So=64)
--   'interval' -> every `interval_days` days, counted from start_date
-- day_key pins one specific workout plan to the series, so "Montags Oberkörper, Freitags
-- Unterkörper" is two rules sharing one session type.
CREATE TABLE recurring_rules (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type_id BIGINT      NOT NULL REFERENCES session_types(id) ON DELETE RESTRICT,
    day_key         VARCHAR(16),
    scheduled_time  TIME,
    notes           TEXT,
    pattern         VARCHAR(16) NOT NULL CHECK (pattern IN ('weekly', 'interval')),
    weekdays        SMALLINT    CHECK (weekdays BETWEEN 1 AND 127),
    interval_days   SMALLINT    CHECK (interval_days BETWEEN 1 AND 365),
    start_date      DATE        NOT NULL,
    end_date        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT recurring_rules_pattern_fields CHECK (
        (pattern = 'weekly'   AND weekdays      IS NOT NULL AND interval_days IS NULL) OR
        (pattern = 'interval' AND interval_days IS NOT NULL AND weekdays      IS NULL)
    ),
    CONSTRAINT recurring_rules_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_recurring_rules_user ON recurring_rules(user_id);

-- Dates a rule must never generate again: an occurrence the user deleted on its own, or moved to
-- another day (the moved session lives on as a detached planned_sessions row).
CREATE TABLE recurring_rule_exceptions (
    rule_id       BIGINT NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
    excluded_date DATE   NOT NULL,
    PRIMARY KEY (rule_id, excluded_date)
);

-- Occurrences are materialized into planned_sessions the first time a date range is requested, so
-- status, notes and logging work on a series occurrence exactly as on a one-off session.
-- occurrence_date remembers which date the rule generated, and survives a reschedule of that row.
ALTER TABLE planned_sessions
    ADD COLUMN rule_id BIGINT REFERENCES recurring_rules(id) ON DELETE SET NULL,
    ADD COLUMN occurrence_date DATE;

CREATE UNIQUE INDEX uq_planned_sessions_rule_occurrence
    ON planned_sessions(rule_id, occurrence_date) WHERE rule_id IS NOT NULL;
