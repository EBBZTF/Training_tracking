import type { Plan, Side, WorkoutLog } from '../../types';
import { findExercise } from '../../state/planOps';
import styles from './HistorySheet.module.scss';

interface HistorySheetProps {
  plan: Plan;
  logs: WorkoutLog[];
}

const SIDES: Side[] = ['B', 'L', 'R'];

/** The plan this was logged against has since been deleted; the entry itself stays. */
const GONE = 'gelöschter Plan';

function describeLog(plan: Plan, s: WorkoutLog): string {
  const parts: string[] = [];
  for (const [exId, sides] of Object.entries(s.vals)) {
    const ex = findExercise(plan, exId);
    if (!ex) continue;
    const vs: string[] = [];
    for (const side of SIDES) {
      const values = sides[side];
      if (values)
        vs.push((side === 'B' ? '' : `${side} `) + values.filter((v) => v !== '').join(' / '));
    }
    if (vs.length) parts.push(`${ex.name}: ${vs.join('  |  ')}`);
  }
  return parts.length ? parts.join('\n') : '—';
}

export function HistorySheet({ plan, logs }: HistorySheetProps) {
  const rows = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40);

  return (
    <>
      <h2 className={styles.title}>Verlauf</h2>
      <div className={styles.sub}>{logs.length} Einheiten protokolliert</div>
      {rows.length ? (
        rows.map((s) => {
          const day = plan.days.find((d) => d.id === s.dayId);
          return (
            <div className={styles.entry} key={`${s.date}-${s.dayId}`}>
              <div className={styles.when}>
                {s.date} · {day ? day.title : GONE}
              </div>
              <div className={styles.vals}>{describeLog(plan, s)}</div>
            </div>
          );
        })
      ) : (
        <div className={styles.emptyNote}>
          Noch nichts protokolliert.
          <br />
          Trag deinen ersten Satz ein.
        </div>
      )}
    </>
  );
}
