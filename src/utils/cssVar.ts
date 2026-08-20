import type { CSSProperties } from 'react';
import type { BlockKind } from '../types';

/** The accent color CSS custom property (`--k`) a block's chrome reads from. */
export function blockAccent(kind: BlockKind): CSSProperties {
  return { '--k': `var(--${kind})` } as CSSProperties;
}
