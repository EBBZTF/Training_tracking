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
  const chips = Array.from({ length: count }, (_, i) => {
    const v = getVal(exId, side, i);
    const last = lastVal(exId, side, i);
    const show = v !== '' ? v : last !== '' ? last : '·';
    const unit = v !== '' ? UNIT[type] : last !== '' ? 'zuletzt' : `Satz ${i + 1}`;
    return (
      <button
        key={i}
        type="button"
        className={`${styles.chip} ${v !== '' ? styles.filled : styles.empty}`}
        onClick={() => onOpenEntry(exId, side, i, name, type)}
      >
        <span className={styles.v}>{show}</span>
        <span className={styles.u}>{unit}</span>
      </button>
    );
  });

  return (
    <div className={styles.track}>
      <span className={`${styles.side} ${side !== 'B' ? styles[side] : ''}`}>
        {side === 'B' ? '' : side}
      </span>
      <div className={styles.chips}>{chips}</div>
    </div>
  );
}
