import type { Mode } from '../../types';
import styles from './Footer.module.scss';

interface FooterProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onOpenHistory: () => void;
  onOpenData: () => void;
}

export function Footer({ mode, onModeChange, onOpenHistory, onOpenData }: FooterProps) {
  const cls = (on: boolean) => `${styles.navButton} ${on ? styles.on : ''}`;
  return (
    <footer className={styles.footer}>
      <button type="button" className={cls(mode === 'log')} onClick={() => onModeChange('log')}>
        <span className={styles.ico}>◉</span>Protokoll
      </button>
      <button type="button" className={cls(mode === 'edit')} onClick={() => onModeChange('edit')}>
        <span className={styles.ico}>◎</span>Plan
      </button>
      <button type="button" className={styles.navButton} onClick={onOpenHistory}>
        <span className={styles.ico}>◈</span>Verlauf
      </button>
      <button type="button" className={styles.navButton} onClick={onOpenData}>
        <span className={styles.ico}>◇</span>Daten
      </button>
    </footer>
  );
}
