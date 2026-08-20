import type { Day } from '../../types';
import { Tabs } from '../Tabs/Tabs';
import styles from './Header.module.scss';

interface HeaderProps {
  today: string;
  onTodayChange: (date: string) => void;
  days: Day[];
  dayId: string;
  onDayChange: (dayId: string) => void;
}

export function Header({ today, onTodayChange, days, dayId, onDayChange }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.hrow}>
        <div className={styles.eyebrow}>Training</div>
        <div className={styles.datewrap}>
          <input
            className={styles.dateInput}
            type="date"
            value={today}
            onChange={(e) => onTodayChange(e.target.value)}
          />
        </div>
      </div>
      <Tabs days={days} dayId={dayId} onDayChange={onDayChange} />
    </header>
  );
}
