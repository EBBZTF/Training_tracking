-- Session types: a curated, user-extensible list of activity kinds for planned sessions.
-- user_id IS NULL -> seeded global default, visible to every user, owned by no one.
-- user_id = X     -> custom type created by user X, visible only to them.
CREATE TABLE session_types (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES users(id) ON DELETE CASCADE,
    label      VARCHAR(64)  NOT NULL,
    color      VARCHAR(16),
    icon       VARCHAR(32),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Label must be unique within its scope: one global default per label, one per-user custom label per user.
CREATE UNIQUE INDEX uq_session_types_global_label ON session_types (lower(label)) WHERE user_id IS NULL;
CREATE UNIQUE INDEX uq_session_types_user_label ON session_types (user_id, lower(label)) WHERE user_id IS NOT NULL;

INSERT INTO session_types (user_id, label, color, icon) VALUES
    (NULL, 'Jogging',         '#f97316', 'jogging'),
    (NULL, 'Strength',        '#ef4444', 'strength'),
    (NULL, 'Bouldering',      '#8b5cf6', 'bouldering'),
    (NULL, 'Cycling',         '#22c55e', 'cycling'),
    (NULL, 'Swimming',        '#0ea5e9', 'swimming'),
    (NULL, 'Yoga / Mobility', '#ec4899', 'yoga'),
    (NULL, 'Rest',            '#94a3b8', 'rest'),
    (NULL, 'Other',           '#64748b', 'other');

-- A planned calendar entry: a session of a given type on a given date, optionally linked to a
-- structured plan Day. session_type_id is required even when day_id is set, so every entry always
-- has a renderable color/icon. There is no reschedule-history column/table; rescheduling just
-- overwrites scheduled_date/scheduled_time (matches this codebase's preference for minimal state).
CREATE TABLE planned_sessions (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date  DATE        NOT NULL,
    scheduled_time  TIME,
    session_type_id BIGINT      NOT NULL REFERENCES session_types(id) ON DELETE RESTRICT,
    day_id          BIGINT      REFERENCES days(id) ON DELETE SET NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'done', 'skipped')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planned_sessions_user_date ON planned_sessions(user_id, scheduled_date);
