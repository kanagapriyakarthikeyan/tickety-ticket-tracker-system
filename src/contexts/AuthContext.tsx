
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle email confirmation and redirect
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully, user will be redirected to dashboard');
          
          // Create or update user profile when they sign in
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });
          
          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
          
          // Redirect to dashboard on successful sign in
          if (window.location.pathname === '/auth') {
            window.location.href = '/';
          }
        }
        
        // Handle token refresh
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user is already logged in and on auth page, redirect to dashboard
      if (session?.user && window.location.pathname === '/auth') {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || ''
          }
        }
      });
      
      // If signup is successful but user needs to confirm email
      if (data.user && !data.user.email_confirmed_at && !error) {
        console.log('User signed up, needs email confirmation');
      }
      
      return { error };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data.user) {
        console.log('Sign in successful');
      }
      
      return { error };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
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
