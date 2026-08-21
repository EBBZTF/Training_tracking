import { useState } from 'react';
import type { Slot } from '../../types';
import styles from './NewPlanSheet.module.scss';

interface NewPlanSheetProps {
  onSubmit: (input: { title: string; short: string; slot: Slot }) => void;
}

export function NewPlanSheet({ onSubmit }: NewPlanSheetProps) {
  const [title, setTitle] = useState('');
  const [short, setShort] = useState('');
  const [slot, setSlot] = useState<Slot>('morgens');

  const handleSubmit = () => {
    if (!title.trim() || !short.trim()) return;
    onSubmit({ title: title.trim(), short: short.trim(), slot });
  };

  return (
    <>
      <h2 className={styles.title}>Neuer Plan</h2>
      <div className={styles.sub}>
        Einen neuen Workout-Plan anlegen, z. B. für ein neues Training.
      </div>

      <div className={styles.field}>
        <label>Titel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Gym-Workout"
        />
      </div>

      <div className={styles.field}>
        <label>Kürzel (Tab-Anzeige)</label>
        <input value={short} onChange={(e) => setShort(e.target.value)} placeholder="z. B. Gym" />
      </div>

      <div className={styles.field}>
        <label>Zeitpunkt</label>
        <select value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
          <option value="morgens">Morgens</option>
          <option value="nachmittags">Nachmittags</option>
        </select>
      </div>

      <button
        type="button"
        className={styles.solid}
        onClick={handleSubmit}
        disabled={!title.trim() || !short.trim()}
      >
        Plan anlegen
      </button>
    </>
  );
}
