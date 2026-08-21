import { useState } from 'react';
import type {
  Day,
  EditScope,
  PlannedSession,
  PlannedSessionStatus,
  SessionType,
} from '../../types';
import { sessionTypeAccent } from '../../utils/cssVar';
import styles from './SessionDetailSheet.module.scss';

interface SessionDetailSheetProps {
  session: PlannedSession;
  type: SessionType | undefined;
  day: Day | undefined;
  days: Day[];
  onReschedule: (date: string, time: string | undefined, scope: EditScope) => void;
  onChangePlan: (dayId: string | undefined, scope: EditScope) => void;
  onMarkStatus: (status: PlannedSessionStatus) => void;
  onDelete: (scope: EditScope) => void;
  onStartWorkout: () => void;
}

const STATUS_LABEL: Record<PlannedSessionStatus, string> = {
  planned: 'Geplant',
  done: 'Erledigt',
  skipped: 'Übersprungen',
};

/** An edit that needs the "nur dieser Termin?" question answered before it runs. */
type Pending = { action: 'move' } | { action: 'plan' } | { action: 'delete' };

const PENDING_PROMPT: Record<Pending['action'], string> = {
  move: 'Diesen Termin verschieben oder die ganze Serie ab hier?',
  plan: 'Plan nur für diesen Termin ändern oder ab hier für alle?',
  delete: 'Diesen Termin löschen oder die Serie ab hier beenden?',
};

export function SessionDetailSheet({
  session,
  type,
  day,
  days,
  onReschedule,
  onChangePlan,
  onMarkStatus,
  onDelete,
  onStartWorkout,
}: SessionDetailSheetProps) {
  const [date, setDate] = useState(session.date);
  const [time, setTime] = useState(session.time ?? '');
  const [dayId, setDayId] = useState(session.dayId ?? '');
  const [pending, setPending] = useState<Pending | null>(null);

  const recurring = session.ruleId != null;

  const run = (action: Pending['action'], scope: EditScope) => {
    setPending(null);
    if (action === 'move') onReschedule(date, time || undefined, scope);
    if (action === 'plan') onChangePlan(dayId || undefined, scope);
    if (action === 'delete') onDelete(scope);
  };

  /** A one-off never asks; a series always does. */
  const request = (action: Pending['action']) => {
    if (!recurring) {
      if (action === 'delete' && !window.confirm('Diesen Termin löschen?')) return;
      run(action, 'one');
      return;
    }
    setPending({ action });
  };

  const movable = date !== session.date || (time || undefined) !== session.time;
  const planChanged = (dayId || undefined) !== session.dayId;

  return (
    <>
      <h2 className={styles.title} style={sessionTypeAccent(type)}>
        <span className={styles.dot} />
        {type?.label ?? 'Unbekannt'}
      </h2>
      <div className={styles.sub}>
        {STATUS_LABEL[session.status]}
        {recurring && ' · Teil einer Serie'}
      </div>

      {session.notes && <div className={styles.notes}>{session.notes}</div>}

      {day && (
        <button type="button" className={styles.ghost} onClick={onStartWorkout}>
          {day.title} — Training starten
        </button>
      )}

      {pending && (
        <div className={styles.scope}>
          <div className={styles.scopeText}>{PENDING_PROMPT[pending.action]}</div>
          <button
            type="button"
            className={styles.rowButton}
            onClick={() => run(pending.action, 'one')}
          >
            Nur dieser Termin
          </button>
          <button
            type="button"
            className={styles.rowButton}
            onClick={() => run(pending.action, 'future')}
          >
            Alle künftigen Termine
          </button>
          <button type="button" className={styles.ghost} onClick={() => setPending(null)}>
            Abbrechen
          </button>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Datum</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Zeit</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <button
        type="button"
        className={styles.ghost}
        onClick={() => request('move')}
        disabled={!movable}
      >
        Verschieben
      </button>

      {days.length > 0 && (
        <>
          <div className={styles.field}>
            <label>Workout-Plan</label>
            <select value={dayId} onChange={(e) => setDayId(e.target.value)}>
              <option value="">— kein Workout —</option>
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => request('plan')}
            disabled={!planChanged}
          >
            Plan übernehmen
          </button>
        </>
      )}

      <div className={styles.row}>
        <button type="button" className={styles.rowButton} onClick={() => onMarkStatus('done')}>
          Erledigt markieren
        </button>
        <button type="button" className={styles.rowButton} onClick={() => onMarkStatus('skipped')}>
          Überspringen
        </button>
      </div>

      <button type="button" className={styles.danger} onClick={() => request('delete')}>
        {recurring ? 'Löschen …' : 'Löschen'}
      </button>
    </>
  );
}
