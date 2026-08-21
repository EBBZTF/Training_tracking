import type { ExerciseType, Side } from '../../types';
import { UNIT } from '../../data/constants';
import styles from './ExerciseTrack.module.scss';

interface ExerciseTrackProps {
  exId: string;
  name: string;
  type: ExerciseType;
  side: Side;
  count: number;
  getVal: (exId: string, side: Side, i: number) => string;
  lastVal: (exId: string, side: Side, i: number) => string;
  onOpenEntry: (exId: string, side: Side, i: number, name: string, type: ExerciseType) => void;
}

const SIDE_LABEL: Record<Side, string> = { B: '', L: 'L', R: 'R' };

export function ExerciseTrack({
  exId,
  name,
  type,
  side,
  count,
  getVal,
  lastVal,
  onOpenEntry,
}: ExerciseTrackProps) {
  return (
    <div className={styles.track}>
      <span className={`${styles.side} ${side === 'R' ? styles.sideRight : ''}`}>
        {SIDE_LABEL[side]}
      </span>
      <div className={styles.chips}>
        {Array.from({ length: count }, (_, i) => {
          const current = getVal(exId, side, i);
          const last = lastVal(exId, side, i);
          // An empty chip shows the previous workout's number as a target, greyed out.
          const shown = current || last || '·';
          const unit = current ? UNIT[type] : last ? 'zuletzt' : `Satz ${i + 1}`;
          return (
            <button
              key={i}
              type="button"
              className={`${styles.chip} ${current ? styles.chipFilled : styles.chipEmpty}`}
              onClick={() => onOpenEntry(exId, side, i, name, type)}
            >
              <span className={styles.chipValue}>{shown}</span>
              <span className={styles.chipUnit}>{unit}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
