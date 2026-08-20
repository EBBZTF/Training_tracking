import type { Day } from '../../types';
import styles from './Tabs.module.scss';

interface TabsProps {
  days: Day[];
  dayId: string;
  onDayChange: (dayId: string) => void;
}

export function Tabs({ days, dayId, onDayChange }: TabsProps) {
  return (
    <div className={styles.tabs}>
      {days.map((d) => (
        <button
          key={d.id}
          type="button"
          className={`${styles.tab} ${d.id === dayId ? styles.on : ''}`}
          onClick={() => onDayChange(d.id)}
        >
          <b>{d.short}</b>
          <span>{d.slot ?? ''}</span>
        </button>
      ))}
    </div>
  );
}
