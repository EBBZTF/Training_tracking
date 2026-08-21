import type { Exercise, ExerciseType, Side } from '../../types';
import { UNIT } from '../../data/constants';
import { ExerciseTrack } from '../ExerciseTrack/ExerciseTrack';
import styles from './ExerciseCard.module.scss';

interface ExerciseCardProps {
  exercise: Exercise;
  getVal: (exId: string, side: Side, i: number) => string;
  lastVal: (exId: string, side: Side, i: number) => string;
  onOpenInfo: (exId: string) => void;
  onOpenEntry: (exId: string, side: Side, i: number, name: string, type: ExerciseType) => void;
}

/** Which side gets its own row of set chips, and how many sets each has. */
function tracks(x: Exercise): { side: Side; count: number }[] {
  if (!x.uni) return [{ side: 'B', count: x.sets }];
  return [
    { side: 'L' as Side, count: x.setsL },
    { side: 'R' as Side, count: x.setsR },
  ].filter((t) => t.count > 0);
}

export function ExerciseCard({
  exercise: x,
  getVal,
  lastVal,
  onOpenInfo,
  onOpenEntry,
}: ExerciseCardProps) {
  const sets = x.uni ? `${x.setsL || 0}/${x.setsR || 0}` : `${x.sets}`;

  return (
    <div className={styles.exercise}>
      <div className={styles.head}>
        <div className={styles.heading}>
          <div className={styles.name}>{x.name}</div>
          <div className={styles.spec}>{`${sets} × ${x.reps}  ·  ${UNIT[x.type]}`}</div>
        </div>
        {x.desc && (
          <button
            type="button"
            className={styles.info}
            aria-label={`Anleitung zu ${x.name}`}
            onClick={() => onOpenInfo(x.id)}
          >
            i
          </button>
        )}
      </div>

      {tracks(x).map(({ side, count }) => (
        <ExerciseTrack
          key={side}
          exId={x.id}
          name={x.name}
          type={x.type}
          side={side}
          count={count}
          getVal={getVal}
          lastVal={lastVal}
          onOpenEntry={onOpenEntry}
        />
      ))}

      {x.note && <div className={styles.note}>{x.note}</div>}
    </div>
  );
}
