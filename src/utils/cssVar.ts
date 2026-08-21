import type { CSSProperties } from 'react';
import type { BlockKind, SessionType } from '../types';

/** The accent color CSS custom property (`--k`) a block's chrome reads from. */
export function blockAccent(kind: BlockKind): CSSProperties {
  return { '--k': `var(--${kind})` } as CSSProperties;
}

/** The accent color CSS custom property (`--k`) a session type's chip/pill chrome reads from. */
export function sessionTypeAccent(type: SessionType | undefined): CSSProperties {
  return { '--k': type?.color || 'var(--faint)' } as CSSProperties;
}
