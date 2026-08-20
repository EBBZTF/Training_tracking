import { useEffect, useRef, useState } from 'react';
import type { ExerciseType, Side } from '../../types';
import { QUICK, TEXTY, UNIT } from '../../data/constants';
import styles from './EntrySheet.module.scss';

interface EntrySheetProps {
  name: string;
  type: ExerciseType;
  side: Side;
  index: number;
  current: string;
  last: string;
  onSubmit: (value: string) => void;
  onClear: () => void;
}

export function EntrySheet({
  name,
  type,
  side,
  index,
  current,
  last,
  onSubmit,
  onClear,
}: EntrySheetProps) {
  const [value, setValue] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 60);
    return () => window.clearTimeout(t);
  }, []);

  const sideTxt = side === 'L' ? ' · links' : side === 'R' ? ' · rechts' : '';
  const quick = QUICK[type] ?? [];

  return (
    <>
      <h2 className={styles.title}>{name}</h2>
      <div className={styles.sub}>
        Satz {index + 1}
        {sideTxt} · {UNIT[type]}
        {last !== '' ? `  ·  zuletzt ${last}` : ''}
      </div>
      <input
        ref={inputRef}
        className={styles.big}
        value={value}
        type={TEXTY[type] ? 'text' : 'number'}
        inputMode={TEXTY[type] ? undefined : 'decimal'}
        step={TEXTY[type] ? undefined : 'any'}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit(value.trim());
        }}
      />
      <div className={styles.quick}>
        {quick.map((q) => (
          <button key={q} type="button" onClick={() => setValue(String(q))}>
            {q}
          </button>
        ))}
      </div>
      <button type="button" className={styles.solid} onClick={() => onSubmit(value.trim())}>
        Eintragen
      </button>
      <button type="button" className={styles.ghost} onClick={onClear}>
        Wert löschen
      </button>
    </>
  );
}
