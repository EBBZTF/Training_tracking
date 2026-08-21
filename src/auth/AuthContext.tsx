import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authClient from './authClient';
import { getRefreshToken, setTokens, clearTokens, registerOnExpired } from './tokenStore';

interface AuthUser {
  email: string;
  displayName: string | null;
}

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(() => (getRefreshToken() ? 'loading' : 'anonymous'));
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    registerOnExpired(() => {
      setUser(null);
      setStatus('anonymous');
    });
  }, []);

  useEffect(() => {
    const storedRefreshToken = getRefreshToken();
    if (!storedRefreshToken) return;
    authClient
      .refresh(storedRefreshToken)
      .then((result) => {
        setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        setUser({ email: result.email, displayName: result.displayName });
        setStatus('authenticated');
      })
      .catch(() => {
        clearTokens();
        setStatus('anonymous');
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authClient.login(email, password);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser({ email: result.email, displayName: result.displayName });
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    const result = await authClient.register(email, password, displayName);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser({ email: result.email, displayName: result.displayName });
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    const rt = getRefreshToken();
    clearTokens();
    setUser(null);
    setStatus('anonymous');
    if (rt) void authClient.logout(rt);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
