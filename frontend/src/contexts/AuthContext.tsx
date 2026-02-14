'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

interface User {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = storage.getUser();
    const token = storage.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { api } = await import('@/lib/api');
    const { user: u, token } = await api.signIn(email, password);
    storage.setToken(token);
    storage.setUser(u);
    setUser(u);
  };

  const signUp = async (email: string, password: string) => {
    const { api } = await import('@/lib/api');
    const { user: u, token } = await api.signUp(email, password);
    storage.setToken(token);
    storage.setUser(u);
    setUser(u);
  };

  const signOut = () => {
    storage.clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
