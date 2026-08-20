import type { Session } from '../../types';
import { blockAccent } from '../../utils/cssVar';
import styles from './WarmupSection.module.scss';

interface WarmupSectionProps {
  items: string[];
  session: Session | undefined;
  open: boolean;
  onToggleOpen: () => void;
  onToggleItem: (index: number) => void;
}

export function WarmupSection({
  items,
  session,
  open,
  onToggleOpen,
  onToggleItem,
}: WarmupSectionProps) {
  const done = session?.warm ?? [];
  const n = done.filter(Boolean).length;

  return (
    <div className={styles.warm}>
      <button type="button" className={styles.wtog} onClick={onToggleOpen}>
        <span className={styles.dot} style={blockAccent('explosiv')} />
        <span className={styles.btitle}>Aufwärmen</span>
        <span className={styles.bmeta}>
          {n}/{items.length}
          {open ? '  ▲' : '  ▼'}
        </span>
      </button>
      {open && (
        <div className={styles.wbody}>
          {items.map((item, i) => (
            <div
              key={i}
              className={`${styles.witem} ${done[i] ? styles.on : ''}`}
              onClick={() => onToggleItem(i)}
            >
              <span className={styles.box} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
