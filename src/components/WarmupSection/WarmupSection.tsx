import type { Session } from '../../types';
import { blockAccent } from '../../utils/cssVar';
import type { WarmupActions } from '../types';
import styles from './WarmupSection.module.scss';

interface WarmupSectionProps {
  items: string[];
  session: Session | undefined;
  open: boolean;
  editing: boolean;
  onToggleOpen: () => void;
  onToggleItem: (index: number) => void;
  actions: WarmupActions;
}

export function WarmupSection({
  items,
  session,
  open,
  editing,
  onToggleOpen,
  onToggleItem,
  actions,
}: WarmupSectionProps) {
  const done = session?.warm ?? [];
  const n = done.filter(Boolean).length;

  return (
    <div className={styles.warm}>
      <button type="button" className={styles.wtog} onClick={onToggleOpen}>
        <span className={styles.dot} style={blockAccent('explosiv')} />
        <span className={styles.btitle}>Aufwärmen</span>
        <span className={styles.bmeta}>
          {editing ? items.length : `${n}/${items.length}`}
          {open ? '  ▲' : '  ▼'}
        </span>
      </button>
      {open && (
        <div className={styles.wbody}>
          {editing
            ? items.map((item, i) => (
                <div key={i} className={styles.wedit}>
                  <input
                    value={item}
                    onChange={(e) => actions.setWarmupText(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.mini}
                    onClick={() => actions.moveWarmupItem(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.mini}
                    onClick={() => actions.moveWarmupItem(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={`${styles.mini} ${styles.danger}`}
                    onClick={() => {
                      if (window.confirm('Punkt löschen?')) actions.deleteWarmupItem(i);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            : items.map((item, i) => (
                <div
                  key={i}
                  className={`${styles.witem} ${done[i] ? styles.on : ''}`}
                  onClick={() => onToggleItem(i)}
                >
                  <span className={styles.box} />
                  <span>{item}</span>
                </div>
              ))}
          {editing && (
            <button type="button" className={styles.addbtn} onClick={() => actions.addWarmupItem()}>
              + Punkt
            </button>
          )}
        </div>
      )}
    </div>
  );
}
