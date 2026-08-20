import type { ReactNode } from 'react';
import styles from './Sheet.module.scss';

interface SheetProps {
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ onClose, children }: SheetProps) {
  return (
    <div className={styles.sheet} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
