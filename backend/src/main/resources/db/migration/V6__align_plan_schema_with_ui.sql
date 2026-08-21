-- Three corrections, all of them the schema catching up with what the UI can actually do.

-- 1. sessions.day_id had the same flaw V4 fixed for planned_sessions: PUT /api/state deletes and
-- recreates every day row on each plan save, so a surrogate FK is not a stable reference. It also
-- made "delete all plans" impossible — the logs kept in that same payload had nowhere to point, and
-- the NOT NULL insert failed, rolling the whole save back. day_key is stable across those rewrites
-- and survives a plan being deleted, so the history outlives the plan it was logged against.
ALTER TABLE sessions ADD COLUMN day_key VARCHAR(16);
UPDATE sessions s SET day_key = d.day_key FROM days d WHERE d.id = s.day_id;
DELETE FROM sessions WHERE day_key IS NULL;
ALTER TABLE sessions ALTER COLUMN day_key SET NOT NULL;
-- Dropping day_id also drops UNIQUE (user_id, session_date, day_id), which referenced it.
ALTER TABLE sessions DROP COLUMN day_id;
ALTER TABLE sessions ADD CONSTRAINT uq_sessions_user_date_day UNIQUE (user_id, session_date, day_key);

-- 2. A block shared across every day of a plan was only ever reachable through the seeded plan that
-- predates user accounts: nothing in the UI creates one, and no editor targets one. Any that still
-- exist move onto the user's first day rather than being dropped, then the column goes.
ALTER TABLE blocks DROP CONSTRAINT chk_block_scope;
UPDATE blocks b
   SET day_id = (SELECT d.id FROM days d WHERE d.user_id = b.user_id ORDER BY d.position LIMIT 1),
       is_shared = FALSE
 WHERE b.is_shared;
DELETE FROM blocks WHERE day_id IS NULL;
ALTER TABLE blocks DROP COLUMN is_shared;
ALTER TABLE blocks ALTER COLUMN day_id SET NOT NULL;

-- 3. kind and slot are closed sets on the client but were unconstrained here, unlike the sibling
-- columns exercises.type and session_values.side. Imported rows are normalized to the fallback the
-- editor itself uses before the constraints go on.
UPDATE blocks SET kind = 'core'
 WHERE kind NOT IN ('huefte', 'skill', 'kraft', 'explosiv', 'core', 'ausdauer');
ALTER TABLE blocks ADD CONSTRAINT chk_blocks_kind
    CHECK (kind IN ('huefte', 'skill', 'kraft', 'explosiv', 'core', 'ausdauer'));

UPDATE days SET slot = 'nachmittags' WHERE slot IS NULL OR slot NOT IN ('morgens', 'nachmittags');
ALTER TABLE days ALTER COLUMN slot SET NOT NULL;
ALTER TABLE days ADD CONSTRAINT chk_days_slot CHECK (slot IN ('morgens', 'nachmittags'));
