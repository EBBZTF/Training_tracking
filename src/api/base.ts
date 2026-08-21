const DEFAULT_API_BASE = 'http://localhost:8080/api';

/**
 * `window.API_BASE`, set via an inline script before the bundle loads, lets a static deploy
 * point at its backend without a rebuild — see docs/BACKEND.md.
 */
export function apiBase(): string {
  return window.API_BASE || import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;
}
