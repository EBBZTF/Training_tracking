import { createContext } from 'react';

export interface AuthUser {
  email: string;
  displayName: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

/** Split from AuthProvider so the provider module exports only its component (fast refresh). */
export const AuthContext = createContext<AuthContextValue | null>(null);
