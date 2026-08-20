import type { BlockRef, BlockView, ExerciseType, Side } from '../../types';
import { blockAccent } from '../../utils/cssVar';
import { ExerciseCard } from '../ExerciseCard/ExerciseCard';
import { ExerciseEditor } from '../ExerciseEditor/ExerciseEditor';
import type { ExerciseActions } from '../types';
import styles from './BlockSection.module.scss';

interface BlockSectionProps {
  block: BlockView;
  blockRef: BlockRef;
  editing: boolean;
  getVal: (exId: string, side: Side, i: number) => string;
  lastVal: (exId: string, side: Side, i: number) => string;
  onOpenInfo: (exId: string) => void;
  onOpenEntry: (exId: string, side: Side, i: number, name: string, type: ExerciseType) => void;
  actions: ExerciseActions;
}

export function BlockSection({
  block,
  blockRef,
  editing,
  getVal,
  lastVal,
  onOpenInfo,
  onOpenEntry,
  actions,
}: BlockSectionProps) {
  return (
    <section className={styles.block} style={blockAccent(block.kind)}>
      <div className={styles.bhead}>
        <span className={styles.dot} />
        <span className={styles.btitle}>{block.name}</span>
        {block.shared && <span className={styles.bmeta}>jeden Tag</span>}
      </div>

      {block.ex.map((x) =>
        editing ? (
          <ExerciseEditor key={x.id} exercise={x} blockRef={blockRef} actions={actions} />
        ) : (
          <ExerciseCard
            key={x.id}
            exercise={x}
            getVal={getVal}
            lastVal={lastVal}
            onOpenInfo={onOpenInfo}
            onOpenEntry={onOpenEntry}
          />
        ),
      )}

      {editing && (
        <button
          type="button"
          className={styles.addbtn}
          onClick={() => actions.addExercise(blockRef)}
        >
          + Übung
        </button>
      )}
    </section>
  );
}
