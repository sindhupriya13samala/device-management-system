import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Also set supabaseUser if you have it in local storage
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find((u: User) => u.email === email && u.password === password);

        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('user', JSON.stringify(foundUser));
          toast.success('Signed in successfully');
          setLoading(false);
          resolve();
        } else {
          toast.error('Invalid credentials.');
          setLoading(false);
          resolve();
        }
      }, 500);
    });
  };

  const signUp = async (email: string, password: string, role: string) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: User) => u.email === email);

        if (existingUser) {
          toast.error('User with this email already exists.');
          setLoading(false);
          resolve();
        } else {
          const newUser: User = {
            id: new Date().toISOString(),
            email,
            password, // In a real app, hash this password
            role: role as 'admin' | 'manager' | 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          toast.success('Signed up successfully');
          setLoading(false);
          resolve();
        }
      }, 500);
    });
  };

  const signOut = async () => {
    setUser(null);
    setSupabaseUser(null);
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    return Promise.resolve();
  };

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
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
