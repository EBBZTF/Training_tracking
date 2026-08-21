import { useState } from 'react';
import type { Day, Slot } from '../../types';
import type { DayInput } from '../../hooks/useTrainingState';
import styles from './PlanSheet.module.scss';

interface PlanSheetProps {
  /** The plan being edited, or undefined when creating a new one. */
  day?: Day;
  onSubmit: (input: DayInput) => void;
  onDelete?: () => void;
}

const SLOTS: { value: Slot; label: string }[] = [
  { value: 'morgens', label: 'Morgens' },
  { value: 'nachmittags', label: 'Nachmittags' },
];

export function PlanSheet({ day, onSubmit, onDelete }: PlanSheetProps) {
  const [title, setTitle] = useState(day?.title ?? '');
  const [short, setShort] = useState(day?.short ?? '');
  const [slot, setSlot] = useState<Slot>(day?.slot ?? 'morgens');

  const complete = Boolean(title.trim() && short.trim());

  const handleSubmit = () => {
    if (!complete) return;
    onSubmit({ title: title.trim(), short: short.trim(), slot });
  };

  return (
    <>
      <h2 className={styles.title}>{day ? 'Plan bearbeiten' : 'Neuer Plan'}</h2>
      <div className={styles.sub}>
        {day
          ? 'Titel, Kürzel und Zeitpunkt dieses Workout-Plans ändern.'
          : 'Einen neuen Workout-Plan anlegen, z. B. für ein neues Training.'}
      </div>

      <div className={styles.field}>
        <label htmlFor="plan-title">Titel</label>
        <input
          id="plan-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Gym-Workout"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="plan-short">Kürzel (Tab-Anzeige)</label>
        <input
          id="plan-short"
          value={short}
          onChange={(e) => setShort(e.target.value)}
          placeholder="z. B. Gym"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="plan-slot">Zeitpunkt</label>
        <select id="plan-slot" value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
          {SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className={styles.solid} onClick={handleSubmit} disabled={!complete}>
        {day ? 'Änderungen speichern' : 'Plan anlegen'}
      </button>

      {onDelete && day && (
        <button
          type="button"
          className={styles.danger}
          onClick={() => {
            if (
              window.confirm(
                `Plan "${day.title}" mit allen Übungen löschen? Bereits protokollierte Einheiten bleiben im Verlauf.`,
              )
            ) {
              onDelete();
            }
          }}
        >
          Plan löschen
        </button>
      )}
    </>
  );
}
