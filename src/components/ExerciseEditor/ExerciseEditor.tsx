import type { BlockRef, Exercise } from '../../types';
import { EXERCISE_TYPES, UNIT } from '../../data/constants';
import type { ExerciseActions } from '../types';
import styles from './ExerciseEditor.module.scss';

interface ExerciseEditorProps {
  exercise: Exercise;
  blockRef: BlockRef;
  actions: ExerciseActions;
}

export function ExerciseEditor({ exercise: x, blockRef, actions }: ExerciseEditorProps) {
  return (
    <div className={styles.edit}>
      <div className={`${styles.f} ${styles.wide}`}>
        <label>Übung</label>
        <input
          value={x.name}
          onChange={(e) => actions.setText(blockRef, x.id, 'name', e.target.value)}
        />
      </div>
      <div className={styles.grid}>
        <div className={styles.f}>
          <label>Belastung</label>
          <select
            value={x.type}
            onChange={(e) => actions.setType(blockRef, x.id, e.target.value as Exercise['type'])}
          >
            {EXERCISE_TYPES.map((t) => (
              <option key={t} value={t}>
                {UNIT[t]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.f}>
          <label>Wiederholungen</label>
          <input
            value={x.reps}
            onChange={(e) => actions.setText(blockRef, x.id, 'reps', e.target.value)}
          />
        </div>
        <div className={styles.f}>
          <label>Seiten</label>
          <select
            value={x.uni ? '1' : '0'}
            onChange={(e) => actions.setUni(blockRef, x.id, e.target.value === '1')}
          >
            <option value="0">Beidseitig</option>
            <option value="1">Links / rechts</option>
          </select>
        </div>
        {x.uni ? (
          <div className={styles.f}>
            <label>Sätze L / R</label>
            <div className={styles.setsRow}>
              <input
                type="number"
                inputMode="numeric"
                value={x.setsL || 0}
                onChange={(e) => actions.setSets(blockRef, x.id, 'setsL', Number(e.target.value))}
              />
              <input
                type="number"
                inputMode="numeric"
                value={x.setsR || 0}
                onChange={(e) => actions.setSets(blockRef, x.id, 'setsR', Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <div className={styles.f}>
            <label>Sätze</label>
            <input
              type="number"
              inputMode="numeric"
              value={x.sets || 1}
              onChange={(e) => actions.setSets(blockRef, x.id, 'sets', Number(e.target.value))}
            />
          </div>
        )}
        <div className={`${styles.f} ${styles.wide}`}>
          <label>Notiz — kurzer Hinweis unter der Übung</label>
          <input
            value={x.note ?? ''}
            onChange={(e) => actions.setText(blockRef, x.id, 'note', e.target.value)}
          />
        </div>
        <div className={`${styles.f} ${styles.wide}`}>
          <label>Anleitung — Text hinter dem i</label>
          <textarea
            rows={4}
            value={x.desc ?? ''}
            onChange={(e) => actions.setText(blockRef, x.id, 'desc', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.erow}>
        <button
          type="button"
          className={styles.mini}
          onClick={() => actions.moveExercise(blockRef, x.id, -1)}
        >
          ↑ Hoch
        </button>
        <button
          type="button"
          className={styles.mini}
          onClick={() => actions.moveExercise(blockRef, x.id, 1)}
        >
          ↓ Runter
        </button>
        <button
          type="button"
          className={`${styles.mini} ${styles.danger} ${styles.spacer}`}
          onClick={() => {
            if (window.confirm('Übung löschen?')) actions.deleteExercise(blockRef, x.id);
          }}
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
