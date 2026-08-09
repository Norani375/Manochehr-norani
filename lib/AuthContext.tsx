'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  changePassword: async () => {},
  loginAsGuest: () => {},
});

const DEFAULT_SYSTEM_USER = {
  uid: 'system_admin_user',
  email: 'admin@barakatullah.com',
  displayName: 'مدیر سیستم (برکت‌الله غفوری)',
  isAnonymous: false,
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_SYSTEM_USER);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const isLoggedOut = localStorage.getItem('bg_user_logged_out');
      if (isLoggedOut === 'true') {
        setUser(null);
      } else {
        const savedGuest = localStorage.getItem('bg_guest_session');
        if (savedGuest) {
          setUser(JSON.parse(savedGuest));
        } else {
          setUser(DEFAULT_SYSTEM_USER);
        }
      }
    } catch (_) {}

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase Auth notice:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loginAsGuest = () => {
    const guestUser = {
      uid: 'guest_user_demo',
      email: 'guest@barakatullah.com',
      displayName: 'کاربر مهمان',
      isAnonymous: true,
    } as unknown as User;
    setUser(guestUser);
    try {
      localStorage.removeItem('bg_user_logged_out');
      localStorage.setItem('bg_guest_session', JSON.stringify(guestUser));
    } catch (_) {}
  };

  const logout = async () => {
    try {
      localStorage.setItem('bg_user_logged_out', 'true');
      localStorage.removeItem('bg_guest_session');
    } catch (_) {}
    await signOut(auth).catch(() => {});
    setUser(null);
  };

  const changePassword = async (newPassword: string) => {
    if (user) {
      await updatePassword(user, newPassword);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, changePassword, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
