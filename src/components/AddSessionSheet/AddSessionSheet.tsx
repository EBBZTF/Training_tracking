import { useState } from 'react';
import type { Day, RecurrencePattern, SessionType } from '../../types';
import { sessionTypeAccent } from '../../utils/cssVar';
import { WEEKDAY_SHORT, weekdayBit } from '../../utils/date';
import styles from './AddSessionSheet.module.scss';

/** "Einmalig" is not a rule at all — it creates a single planned session. */
type Repeat = 'once' | RecurrencePattern;

interface AddSessionSheetProps {
  date: string;
  types: SessionType[];
  days: Day[];
  onAddType: (input: {
    label: string;
    color?: string;
    icon?: string;
  }) => Promise<SessionType | null>;
  onSubmit: (input: {
    date: string;
    time?: string;
    sessionTypeId: number;
    dayId?: string;
    notes?: string;
  }) => void;
  onSubmitRule: (input: {
    sessionTypeId: number;
    dayId?: string;
    time?: string;
    notes?: string;
    pattern: RecurrencePattern;
    weekdays?: number;
    intervalDays?: number;
    startDate: string;
    endDate?: string;
  }) => void;
}

const REPEAT_LABEL: Record<Repeat, string> = {
  once: 'Einmalig',
  weekly: 'Wöchentlich',
  interval: 'Alle X Tage',
};

export function AddSessionSheet({
  date,
  types,
  days,
  onAddType,
  onSubmit,
  onSubmitRule,
}: AddSessionSheetProps) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [time, setTime] = useState('');
  const [sessionTypeId, setSessionTypeId] = useState<number | null>(types[0]?.id ?? null);
  const [dayId, setDayId] = useState('');
  const [notes, setNotes] = useState('');
  const [repeat, setRepeat] = useState<Repeat>('once');
  // Starts on the weekday of the tapped date, which is what "jeden Montag" means from a Monday.
  const [weekdays, setWeekdays] = useState(() => weekdayBit(date));
  const [intervalDays, setIntervalDays] = useState(3);
  const [endDate, setEndDate] = useState('');
  const [newTypeOpen, setNewTypeOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#5b9bc9');
  const [newIcon, setNewIcon] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleWeekday = (index: number) => setWeekdays((mask) => mask ^ (1 << index));

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

  const incomplete =
    sessionTypeId == null ||
    (repeat === 'weekly' && weekdays === 0) ||
    (repeat === 'interval' && intervalDays < 1);

  const handleSubmit = () => {
    if (sessionTypeId == null || incomplete) return;
    const shared = {
      sessionTypeId,
      dayId: dayId || undefined,
      time: time || undefined,
      notes: notes.trim() || undefined,
    };
    if (repeat === 'once') {
      onSubmit({ date: selectedDate, ...shared });
      return;
    }
    onSubmitRule({
      ...shared,
      pattern: repeat,
      weekdays: repeat === 'weekly' ? weekdays : undefined,
      intervalDays: repeat === 'interval' ? intervalDays : undefined,
      startDate: selectedDate,
      endDate: endDate || undefined,
    });
  };

  return (
    <>
      <h2 className={styles.title}>Termin planen</h2>
      <div className={styles.sub}>Aktivität auswählen und einen Tag festlegen.</div>

      <div className={styles.newTypeRow}>
        <div className={`${styles.field} ${styles.grow}`}>
          <label>{repeat === 'once' ? 'Datum' : 'Ab'}</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value) setWeekdays(weekdayBit(e.target.value));
            }}
          />
        </div>
        <div className={styles.field}>
          <label>Zeit</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
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
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
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

      {days.length > 0 && (
        <div className={styles.field}>
          <label>Workout-Plan (optional)</label>
          <select value={dayId} onChange={(e) => setDayId(e.target.value)}>
            <option value="">— kein Workout —</option>
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label>Wiederholung</label>
        <div className={styles.chips}>
          {(['once', 'weekly', 'interval'] as Repeat[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.seg} ${r === repeat ? styles.segOn : ''}`}
              onClick={() => setRepeat(r)}
            >
              {REPEAT_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {repeat === 'weekly' && (
        <div className={styles.field}>
          <label>An diesen Tagen</label>
          <div className={styles.weekdays}>
            {WEEKDAY_SHORT.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`${styles.weekday} ${weekdays & (1 << index) ? styles.weekdayOn : ''}`}
                aria-pressed={(weekdays & (1 << index)) !== 0}
                onClick={() => toggleWeekday(index)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {repeat === 'interval' && (
        <div className={styles.field}>
          <label>Abstand in Tagen</label>
          <input
            type="number"
            min={1}
            max={365}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
          />
        </div>
      )}

      {repeat !== 'once' && (
        <div className={styles.field}>
          <label>Ende (optional)</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      )}

      <div className={styles.field}>
        <label>Notiz (optional)</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <button type="button" className={styles.solid} onClick={handleSubmit} disabled={incomplete}>
        {repeat === 'once' ? 'Termin anlegen' : 'Serie anlegen'}
      </button>
    </>
  );
}
