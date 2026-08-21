import type { Day } from '../../types';
import { Tabs } from '../Tabs/Tabs';
import styles from './Header.module.scss';

interface HeaderProps {
  today: string;
  onTodayChange: (date: string) => void;
  days: Day[];
  dayId: string;
  onDayChange: (dayId: string) => void;
  view: 'training' | 'calendar';
  onViewChange: (view: 'training' | 'calendar') => void;
}

export function Header({
  today,
  onTodayChange,
  days,
  dayId,
  onDayChange,
  view,
  onViewChange,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.hrow}>
        <div className={styles.eyebrow}>Training</div>
        <div className={styles.datewrap}>
          {view === 'training' && (
            <input
              className={styles.dateInput}
              type="date"
              value={today}
              onChange={(e) => onTodayChange(e.target.value)}
            />
          )}
          <button
            type="button"
            className={styles.viewToggle}
            onClick={() => onViewChange(view === 'training' ? 'calendar' : 'training')}
          >
            {view === 'training' ? 'Kalender' : 'Training'}
          </button>
        </div>
      </div>
      {view === 'training' && <Tabs days={days} dayId={dayId} onDayChange={onDayChange} />}
    </header>
  );
}
