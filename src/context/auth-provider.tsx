
'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, authenticateUser } from '@/lib/data';
import type { User, UserRole } from '@/lib/definitions';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isTouring: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  switchTourRole: (role: UserRole) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUserEmails = [
    'consultant.demo@autodrive.com',
    'service.writer.demo@autodrive.com',
    'owner.demo@autodrive.com',
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTouring, setIsTouring] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // In a real app, you'd fetch the user profile from your backend
        // For this demo, we'll use our mock data function
        const userProfile = await getUserById(firebaseUser.uid);
        setUser(userProfile);
        setIsTouring(demoUserEmails.includes(userProfile?.email || ''));
      } else {
        setUser(null);
        setIsTouring(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await authenticateUser(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsTouring(demoUserEmails.includes(loggedInUser.email));
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    setUser(null);
    setIsTouring(false);
    router.push('/login');
  };

  const switchTourRole = useCallback(async (role: UserRole) => {
      let email = '';
      switch (role) {
          case 'Sales Consultant':
              email = 'consultant.demo@autodrive.com';
              break;
          case 'Service Writer':
              email = 'service.writer.demo@autodrive.com';
              break;
          case 'Owner':
              email = 'owner.demo@autodrive.com';
              break;
          default:
              return;
      }
      const tourUser = await authenticateUser(email, 'password');
      if (tourUser) {
          setUser(tourUser);
      }
  }, []);

  const value = { user, loading, isTouring, login, logout, setUser, switchTourRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
