import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Função para verificar se o token JWT está expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // Token inválido = expirado
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('ymr_auth_user');
      const savedToken = localStorage.getItem('ymr_access_token');
      
      if (savedUser && savedToken && !isTokenExpired(savedToken)) {
        setUser(JSON.parse(savedUser));
        setAccessToken(savedToken);
      } else {
        // Token expirado ou ausente → limpar tudo
        logout();
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
      logout();
    }
  }, []);

  function login(nextUser: AuthUser, token: string) {
    setUser(nextUser);
    setAccessToken(token);
    try {
      localStorage.setItem('ymr_auth_user', JSON.stringify(nextUser));
      localStorage.setItem('ymr_access_token', token);
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem('ymr_auth_user');
      localStorage.removeItem('ymr_access_token');
      localStorage.removeItem('cart_session'); // ← ADICIONE ISTO!
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!user && !!accessToken && !isTokenExpired(accessToken),
    user,
    accessToken,
    login,
    logout,
  }), [user, accessToken]);

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