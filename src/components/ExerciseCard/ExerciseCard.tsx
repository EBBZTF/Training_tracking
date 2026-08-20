import type { Exercise, Side } from '../../types';
import { UNIT } from '../../data/constants';
import { ExerciseTrack } from '../ExerciseTrack/ExerciseTrack';
import styles from './ExerciseCard.module.scss';

interface ExerciseCardProps {
  exercise: Exercise;
  getVal: (exId: string, side: Side, i: number) => string;
  lastVal: (exId: string, side: Side, i: number) => string;
  onOpenInfo: (exId: string) => void;
  onOpenEntry: (exId: string, side: Side, i: number, name: string, type: Exercise['type']) => void;
}

export function ExerciseCard({
  exercise: x,
  getVal,
  lastVal,
  onOpenInfo,
  onOpenEntry,
}: ExerciseCardProps) {
  const spec = x.uni
    ? `${x.setsL || 0}/${x.setsR || 0} × ${x.reps}  ·  ${UNIT[x.type]}`
    : `${x.sets} × ${x.reps}  ·  ${UNIT[x.type]}`;

  return (
    <div className={styles.ex}>
      <div className={styles.etop}>
        <div>
          <div className={styles.ename}>{x.name}</div>
          <div className={styles.espec}>{spec}</div>
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

      {x.uni ? (
        <>
          {x.setsL > 0 && (
            <ExerciseTrack
              exId={x.id}
              name={x.name}
              type={x.type}
              side="L"
              count={x.setsL}
              getVal={getVal}
              lastVal={lastVal}
              onOpenEntry={onOpenEntry}
            />
          )}
          {x.setsR > 0 && (
            <ExerciseTrack
              exId={x.id}
              name={x.name}
              type={x.type}
              side="R"
              count={x.setsR}
              getVal={getVal}
              lastVal={lastVal}
              onOpenEntry={onOpenEntry}
            />
          )}
        </>
      ) : (
        <ExerciseTrack
          exId={x.id}
          name={x.name}
          type={x.type}
          side="B"
          count={x.sets}
          getVal={getVal}
          lastVal={lastVal}
          onOpenEntry={onOpenEntry}
        />
      )}

      {x.note && <div className={styles.enote}>{x.note}</div>}
    </div>
  );
}
