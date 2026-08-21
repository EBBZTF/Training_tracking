import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { AppState } from '../../types';
import styles from './DataSheet.module.scss';

interface DataSheetProps {
  state: AppState;
  today: string;
  onImport: (data: AppState) => void;
  onReset: () => void;
  notify: (message: string) => void;
  userEmail: string;
  onLogout: () => void;
  onReopenIntro: () => void;
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return !!v.plan && Array.isArray(v.logs);
}

export function DataSheet({
  state,
  today,
  onImport,
  onReset,
  notify,
  userEmail,
  onLogout,
  onReopenIntro,
}: DataSheetProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `training-${today}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify('Exportiert');
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(reader.result as string);
        if (!isAppState(data)) throw new Error('invalid shape');
        onImport(data);
        notify('Importiert');
      } catch {
        notify('Datei nicht lesbar');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Alle Pläne löschen? Protokollierte Einheiten bleiben erhalten.')) {
      onReset();
      notify('Pläne gelöscht');
    }
  };

  return (
    <>
      <h2 className={styles.title}>Daten</h2>
      <div className={styles.sub}>
        Deine Daten liegen in der Postgres-Datenbank hinter deinem Backend. Sichere sie trotzdem
        regelmässig — für den Fall eines Ausfalls oder versehentlichen Löschens.
      </div>
      <button type="button" className={styles.solid} onClick={handleExport}>
        Als JSON exportieren
      </button>
      <button type="button" className={styles.ghost} onClick={() => fileRef.current?.click()}>
        JSON importieren
      </button>
      <button type="button" className={styles.ghost} onClick={onReopenIntro}>
        Einführung nochmal ansehen
      </button>
      <button type="button" className={styles.reset} onClick={handleReset}>
        Alle Pläne löschen
      </button>

      <h2 className={styles.title}>Konto</h2>
      <div className={styles.sub}>Angemeldet als {userEmail}</div>
      <button type="button" className={styles.ghost} onClick={onLogout}>
        Abmelden
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </>
  );
}
