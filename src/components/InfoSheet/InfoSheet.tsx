import type { Exercise } from '../../types';
import { UNIT } from '../../data/constants';
import styles from './InfoSheet.module.scss';

interface InfoSheetProps {
  exercise: Exercise;
  onClose: () => void;
}

export function InfoSheet({ exercise: x, onClose }: InfoSheetProps) {
  const spec = x.uni ? `${x.setsL || 0}/${x.setsR || 0} × ${x.reps}` : `${x.sets} × ${x.reps}`;
  return (
    <>
      <h2 className={styles.title}>{x.name}</h2>
      <div className={styles.sub}>
        {spec} · {UNIT[x.type]}
      </div>
      <div className={styles.guide}>{x.desc || 'Keine Anleitung hinterlegt.'}</div>
      {x.note && (
        <div className={styles.cue}>
          <span className={styles.cuelabel}>Achte darauf</span>
          {x.note}
        </div>
      )}
      <button type="button" className={styles.solid} onClick={onClose}>
        Schliessen
      </button>
    </>
  );
}
