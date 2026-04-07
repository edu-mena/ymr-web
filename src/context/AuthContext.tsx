import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiLogout } from '../services/api';

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ymr_auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('ymr_auth_user');
    }

    // Escuta evento de expiração de sessão disparado por apiFetch/apiLogout
    const onExpired = () => {
      setUser(null);
      localStorage.removeItem('ymr_auth_user');
    };
    window.addEventListener('ymr:session-expired', onExpired);
    return () => window.removeEventListener('ymr:session-expired', onExpired);
  }, []);

  function login(nextUser: AuthUser) {
    setUser(nextUser);
    try {
      localStorage.setItem('ymr_auth_user', JSON.stringify(nextUser));
    } catch {
      // silencioso
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem('ymr_auth_user');
      localStorage.removeItem('cart_session');
    } catch {
      // silencioso
    }
    apiLogout();
  }

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!user,
    user,
    login,
    logout,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
