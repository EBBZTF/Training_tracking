-- The seeded activity types went in with English labels while the whole UI is German. Only the
-- global rows (user_id IS NULL) are renamed; ids stay put, so every planned session and recurring
-- rule keeps pointing at the same type. Custom per-user types are left alone.
UPDATE session_types SET label = 'Laufen'     WHERE user_id IS NULL AND label = 'Jogging';
UPDATE session_types SET label = 'Kraft'      WHERE user_id IS NULL AND label = 'Strength';
UPDATE session_types SET label = 'Bouldern'   WHERE user_id IS NULL AND label = 'Bouldering';
UPDATE session_types SET label = 'Radfahren'  WHERE user_id IS NULL AND label = 'Cycling';
UPDATE session_types SET label = 'Schwimmen'  WHERE user_id IS NULL AND label = 'Swimming';
UPDATE session_types SET label = 'Ruhetag'    WHERE user_id IS NULL AND label = 'Rest';
UPDATE session_types SET label = 'Sonstiges'  WHERE user_id IS NULL AND label = 'Other';
