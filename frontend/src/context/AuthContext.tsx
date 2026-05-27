import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRoleFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('tentacl_token'));
  const [role, setRole] = useState<string | null>(getRoleFromToken(token));

  // Sync state if localStorage changes from another tab/window
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('tentacl_token');
      setToken(newToken);
      setRole(getRoleFromToken(newToken));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('tentacl_token', token);
      setRole(getRoleFromToken(token));
    } else {
      localStorage.removeItem('tentacl_token');
      setRole(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('tentacl_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('tentacl_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
