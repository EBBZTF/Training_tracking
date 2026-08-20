import type { BlockRef, BlockView, Day, ExerciseType, Mode, Session, Side } from '../../types';
import { DayHeader } from '../DayHeader/DayHeader';
import { WarmupSection } from '../WarmupSection/WarmupSection';
import { BlockSection } from '../BlockSection/BlockSection';
import type { ExerciseActions } from '../types';
import styles from './DayView.module.scss';

interface DayViewProps {
  day: Day;
  blocks: BlockView[];
  mode: Mode;
  warmup: string[];
  session: Session | undefined;
  warmOpen: boolean;
  onToggleWarmOpen: () => void;
  onToggleWarmupItem: (index: number) => void;
  getVal: (exId: string, side: Side, i: number) => string;
  lastVal: (exId: string, side: Side, i: number) => string;
  onOpenInfo: (exId: string) => void;
  onOpenEntry: (exId: string, side: Side, i: number, name: string, type: ExerciseType) => void;
  actions: ExerciseActions;
  onAddBlock: (dayId: string) => void;
}

function blockRefFor(block: BlockView, day: Day): BlockRef {
  if (block.shared) return { kind: 'hip' };
  return { kind: 'day', dayId: day.id, index: day.blocks.indexOf(block) };
}

export function DayView({
  day,
  blocks,
  mode,
  warmup,
  session,
  warmOpen,
  onToggleWarmOpen,
  onToggleWarmupItem,
  getVal,
  lastVal,
  onOpenInfo,
  onOpenEntry,
  actions,
  onAddBlock,
}: DayViewProps) {
  const editing = mode === 'edit';

  return (
    <>
      <DayHeader day={day} />

      {!editing && (
        <WarmupSection
          items={warmup}
          session={session}
          open={warmOpen}
          onToggleOpen={onToggleWarmOpen}
          onToggleItem={onToggleWarmupItem}
        />
      )}

      {blocks.map((block) => (
        <BlockSection
          key={block.shared ? 'hip' : `${day.id}-${blocks.indexOf(block)}`}
          block={block}
          blockRef={blockRefFor(block, day)}
          editing={editing}
          getVal={getVal}
          lastVal={lastVal}
          onOpenInfo={onOpenInfo}
          onOpenEntry={onOpenEntry}
          actions={actions}
        />
      ))}

      {editing && (
        <div className={styles.block}>
          <button type="button" className={styles.addbtn} onClick={() => onAddBlock(day.id)}>
            + Block hinzufügen
          </button>
        </div>
      )}
    </>
  );
}
