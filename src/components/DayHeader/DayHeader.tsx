import type { Day } from '../../types';
import styles from './DayHeader.module.scss';

export function DayHeader({ day }: { day: Day }) {
  return (
    <div className={styles.dayhead}>
      <div className={styles.daytitle}>{day.title}</div>
      {day.slot === 'morgens' && (
        <div className={styles.daywarn}>
          Morgeneinheit — Aufwärmen auf 18 Min verlängern, kalte Hüfte braucht länger
        </div>
      )}
    </div>
  );
}
