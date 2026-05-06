import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { hotelApi } from '../api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  saveSession: (user: User) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const saveSession = (nextUser: User): User => {
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    hotelApi.getCurrentUser()
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const logout = () => {
    hotelApi.logout().catch(() => undefined).finally(() => {
      setUser(null);
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
