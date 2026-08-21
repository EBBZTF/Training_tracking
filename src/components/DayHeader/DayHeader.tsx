import type { Day } from '../../types';
import styles from './DayHeader.module.scss';

const SLOT_LABEL: Record<Day['slot'], string> = {
  morgens: 'Morgens',
  nachmittags: 'Nachmittags',
};

export function DayHeader({ day }: { day: Day }) {
  return (
    <div className={styles.dayHeader}>
      <div className={styles.dayTitle}>{day.title}</div>
      <div className={styles.daySlot}>{SLOT_LABEL[day.slot]}</div>
    </div>
  );
}
