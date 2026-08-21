-- No real data exists yet, so this is a clean reset of the plan/log tables rather than a backfill.
DROP TABLE IF EXISTS session_values CASCADE;
DROP TABLE IF EXISTS session_warmup CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS warmup_items CASCADE;
DROP TABLE IF EXISTS days CASCADE;

CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(255),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Refresh tokens are stored hashed so a DB leak alone doesn't hand out usable tokens,
-- and logout/rotation can actually revoke a specific token.
CREATE TABLE refresh_tokens (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Plan structure: days -> blocks -> exercises, plus the shared warmup list. Every row is owned by a user.
CREATE TABLE days (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_key     VARCHAR(16)  NOT NULL,
    short_label VARCHAR(32)  NOT NULL,
    slot        VARCHAR(32),
    title       VARCHAR(255) NOT NULL,
    position    INT          NOT NULL,
    UNIQUE (user_id, day_key)
);

-- A block belongs to exactly one day, OR is shared across every day of its owning user (e.g. the hip block).
CREATE TABLE blocks (
    id        BIGSERIAL    PRIMARY KEY,
    user_id   BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_id    BIGINT       REFERENCES days(id) ON DELETE CASCADE,
    is_shared BOOLEAN      NOT NULL DEFAULT FALSE,
    kind      VARCHAR(32)  NOT NULL,
    name      VARCHAR(255) NOT NULL,
    position  INT          NOT NULL,
    CONSTRAINT chk_block_scope CHECK (
        (is_shared = TRUE  AND day_id IS NULL) OR
        (is_shared = FALSE AND day_id IS NOT NULL)
    )
);

-- client_id is the client-generated uid (kept stable so session_values can reference it across edits);
-- it's only unique within its block now, the surrogate id is the real cross-table reference.
CREATE TABLE exercises (
    id          BIGSERIAL    PRIMARY KEY,
    client_id   VARCHAR(32)  NOT NULL,
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
    position    INT          NOT NULL,
    UNIQUE (block_id, client_id)
);

-- The warmup list is a single ordered list per user, shared by every one of that user's days.
CREATE TABLE warmup_items (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INT       NOT NULL,
    text     TEXT      NOT NULL,
    UNIQUE (user_id, position)
);

-- One logged workout instance for a given user + calendar date + day.
CREATE TABLE sessions (
    id           BIGSERIAL   PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE        NOT NULL,
    day_id       BIGINT      NOT NULL REFERENCES days(id) ON DELETE CASCADE,
    UNIQUE (user_id, session_date, day_id)
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
    exercise_id BIGINT      NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    side        VARCHAR(1)  NOT NULL CHECK (side IN ('B','L','R')),
    set_index   INT         NOT NULL,
    value       VARCHAR(64) NOT NULL,
    PRIMARY KEY (session_id, exercise_id, side, set_index)
);

CREATE INDEX idx_days_user ON days(user_id);
CREATE INDEX idx_blocks_day ON blocks(day_id);
CREATE INDEX idx_blocks_user ON blocks(user_id);
CREATE INDEX idx_exercises_block ON exercises(block_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_user ON sessions(user_id);
