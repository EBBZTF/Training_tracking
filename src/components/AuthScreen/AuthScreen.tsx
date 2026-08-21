import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { AuthError } from '../../auth/authClient';
import styles from './AuthScreen.module.scss';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, displayName.trim());
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.eyebrow}>Training</div>
      <h1 className={styles.title}>{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="E-Mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode === 'register' && (
          <input
            className={styles.input}
            type="text"
            placeholder="Anzeigename (optional)"
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}
        <input
          className={styles.input}
          type="password"
          placeholder="Passwort"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === 'register' ? 8 : undefined}
          required
        />

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.solid} disabled={busy}>
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </button>
      </form>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError(null);
        }}
      >
        {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon registriert? Anmelden'}
      </button>
    </div>
  );
}
