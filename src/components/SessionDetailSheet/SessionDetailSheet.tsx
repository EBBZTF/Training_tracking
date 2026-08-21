import { useState } from 'react';
import type { PlannedSession, PlannedSessionStatus, SessionType } from '../../types';
import { sessionTypeAccent } from '../../utils/cssVar';
import styles from './SessionDetailSheet.module.scss';

interface SessionDetailSheetProps {
  session: PlannedSession;
  type: SessionType | undefined;
  onReschedule: (date: string, time?: string) => void;
  onMarkStatus: (status: PlannedSessionStatus) => void;
  onDelete: () => void;
}

const STATUS_LABEL: Record<PlannedSessionStatus, string> = {
  planned: 'Geplant',
  done: 'Erledigt',
  skipped: 'Übersprungen',
};

export function SessionDetailSheet({
  session,
  type,
  onReschedule,
  onMarkStatus,
  onDelete,
}: SessionDetailSheetProps) {
  const [date, setDate] = useState(session.date);

  const handleDelete = () => {
    if (window.confirm('Diesen Termin löschen?')) onDelete();
  };

  return (
    <>
      <h2 className={styles.title} style={sessionTypeAccent(type)}>
        <span className={styles.dot} />
        {type?.label ?? 'Unbekannt'}
      </h2>
      <div className={styles.sub}>{STATUS_LABEL[session.status]}</div>

      {session.notes && <div className={styles.notes}>{session.notes}</div>}

      <div className={styles.field}>
        <label>Datum</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <button
        type="button"
        className={styles.ghost}
        onClick={() => onReschedule(date, session.time)}
        disabled={date === session.date}
      >
        Verschieben
      </button>

      <div className={styles.row}>
        <button type="button" className={styles.mini} onClick={() => onMarkStatus('done')}>
          Erledigt markieren
        </button>
        <button type="button" className={styles.mini} onClick={() => onMarkStatus('skipped')}>
          Überspringen
        </button>
      </div>

      <button type="button" className={styles.danger} onClick={handleDelete}>
        Löschen
      </button>
    </>
  );
}
