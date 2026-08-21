import { useState } from 'react';
import type { SessionType } from '../../types';
import { sessionTypeAccent } from '../../utils/cssVar';
import styles from './AddSessionSheet.module.scss';

interface AddSessionSheetProps {
  date: string;
  types: SessionType[];
  onAddType: (input: {
    label: string;
    color?: string;
    icon?: string;
  }) => Promise<SessionType | null>;
  onSubmit: (input: {
    date: string;
    time?: string;
    sessionTypeId: number;
    notes?: string;
  }) => void;
}

export function AddSessionSheet({ date, types, onAddType, onSubmit }: AddSessionSheetProps) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(types[0]?.id ?? null);
  const [notes, setNotes] = useState('');
  const [newTypeOpen, setNewTypeOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#5b9bc9');
  const [newIcon, setNewIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreateType = async () => {
    const label = newLabel.trim();
    if (!label) return;
    setSaving(true);
    const created = await onAddType({ label, color: newColor, icon: newIcon.trim() || undefined });
    setSaving(false);
    if (created) {
      setSessionTypeId(created.id);
      setNewTypeOpen(false);
      setNewLabel('');
      setNewIcon('');
    }
  };

  const handleSubmit = () => {
    if (sessionTypeId == null) return;
    onSubmit({
      date: selectedDate,
      sessionTypeId,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <>
      <h2 className={styles.title}>Termin planen</h2>
      <div className={styles.sub}>Aktivität auswählen und einen Tag festlegen.</div>

      <div className={styles.field}>
        <label>Datum</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Art</label>
        <div className={styles.chips}>
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.chip} ${t.id === sessionTypeId ? styles.chipOn : ''}`}
              style={sessionTypeAccent(t)}
              onClick={() => setSessionTypeId(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.chip} ${styles.chipAdd}`}
            onClick={() => setNewTypeOpen((o) => !o)}
          >
            + Neu
          </button>
        </div>
      </div>

      {newTypeOpen && (
        <div className={styles.newType}>
          <div className={styles.field}>
            <label>Bezeichnung</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="z. B. Klettern"
            />
          </div>
          <div className={styles.newTypeRow}>
            <div className={styles.field}>
              <label>Farbe</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.grow}`}>
              <label>Icon (optional)</label>
              <input value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            className={styles.ghost}
            onClick={handleCreateType}
            disabled={!newLabel.trim() || saving}
          >
            Kategorie anlegen
          </button>
        </div>
      )}

      <div className={styles.field}>
        <label>Notiz (optional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button
        type="button"
        className={styles.solid}
        onClick={handleSubmit}
        disabled={sessionTypeId == null}
      >
        Termin anlegen
      </button>
    </>
  );
}
