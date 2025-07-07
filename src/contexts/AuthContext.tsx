import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '@/api/auth';

// Define the AuthContext type
export interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Save user to localStorage when changed
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Assume customer for now. You can extend this to handle assignee logic as needed.
  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.customerLogin(email, password);
      if (!response.error && response.user) {
        setUser(response.user);
        localStorage.setItem('token', response.token || '');
      }
      return { error: response.error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.customerRegister(fullName, email, password);
      return { error: response.error };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    // Implement your reset logic here, or call an API endpoint if available
    // For now, return a placeholder
    return { error: { message: 'Not implemented' } };
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, signIn, signUp, resetPassword }}>
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
