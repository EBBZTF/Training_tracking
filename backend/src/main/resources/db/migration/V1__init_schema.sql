-- Plan structure: days -> blocks -> exercises, plus the shared warmup list.
CREATE TABLE days (
    id          VARCHAR(16)  PRIMARY KEY,
    short_label VARCHAR(32)  NOT NULL,
    slot        VARCHAR(32),
    title       VARCHAR(255) NOT NULL,
    position    INT          NOT NULL
);

-- A block belongs to exactly one day, OR is shared across every day (e.g. the hip block).
CREATE TABLE blocks (
    id        BIGSERIAL    PRIMARY KEY,
    day_id    VARCHAR(16)  REFERENCES days(id) ON DELETE CASCADE,
    is_shared BOOLEAN      NOT NULL DEFAULT FALSE,
    kind      VARCHAR(32)  NOT NULL,
    name      VARCHAR(255) NOT NULL,
    position  INT          NOT NULL,
    CONSTRAINT chk_block_scope CHECK (
        (is_shared = TRUE  AND day_id IS NULL) OR
        (is_shared = FALSE AND day_id IS NOT NULL)
    )
);

-- id is the client-generated uid (kept stable so session_values can reference it across edits).
CREATE TABLE exercises (
    id          VARCHAR(32)  PRIMARY KEY,
    block_id    BIGINT       NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(16)  NOT NULL CHECK (type IN ('kg','band','sek','bw','cm','m','min')),
    uni         BOOLEAN      NOT NULL DEFAULT FALSE,
    sets        INT,
    sets_l      INT,
    sets_r      INT,
    reps        VARCHAR(64)  NOT NULL,
    note        TEXT,
    description TEXT,
    position    INT          NOT NULL
);

-- The warmup list is a single ordered list shared by every day.
CREATE TABLE warmup_items (
    position INT  PRIMARY KEY,
    text     TEXT NOT NULL
);

-- One logged workout instance for a given calendar date + day.
CREATE TABLE sessions (
    id           BIGSERIAL   PRIMARY KEY,
    session_date DATE        NOT NULL,
    day_id       VARCHAR(16) NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    UNIQUE (session_date, day_id)
);

-- Checked-off warmup items for a session, addressed by position in warmup_items.
-- Row presence means checked; there is no "unchecked" state to record.
CREATE TABLE session_warmup (
    session_id BIGINT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    position   INT    NOT NULL,
    PRIMARY KEY (session_id, position)
);

-- Logged value for one set of one exercise (side is B = both/bilateral, L = left, R = right).
CREATE TABLE session_values (
    session_id  BIGINT      NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id VARCHAR(32) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    side        VARCHAR(1)  NOT NULL CHECK (side IN ('B','L','R')),
    set_index   INT         NOT NULL,
    value       VARCHAR(64) NOT NULL,
    PRIMARY KEY (session_id, exercise_id, side, set_index)
);

CREATE INDEX idx_blocks_day ON blocks(day_id);
CREATE INDEX idx_exercises_block ON exercises(block_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
