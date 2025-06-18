import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, validateEmail, sanitizeInput } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  failedAttempts: number;
  isLocked: boolean;
  lockoutTime: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset failed attempts on successful sign in
        if (event === 'SIGNED_IN') {
          setFailedAttempts(0);
          setIsLocked(false);
          setLockoutTime(0);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAccountLockout = (email: string): boolean => {
    const lockoutKey = `lockout-${email}`;
    const maxAttempts = 5;
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes
    
    if (!rateLimiter.isAllowed(lockoutKey, maxAttempts, lockoutDuration)) {
      const remaining = rateLimiter.getRemainingTime(lockoutKey);
      setIsLocked(true);
      setLockoutTime(remaining);
      return false;
    }
    return true;
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Input validation and sanitization
      const cleanEmail = sanitizeInput(email).toLowerCase().trim();
      
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check account lockout
      if (!checkAccountLockout(cleanEmail)) {
        const minutes = Math.ceil(lockoutTime / 60000);
        throw new Error(`Account temporarily locked. Try again in ${minutes} minutes.`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setFailedAttempts(prev => prev + 1);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.');
        }
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        // Show progressive warnings
        if (failedAttempts >= 3) {
          toast({
            title: "Security Warning",
            description: `${5 - failedAttempts} attempts remaining before account lockout`,
            variant: "destructive",
          });
        }
        
        throw error;
      }

      // Check if user exists but email is not confirmed
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Input validation and sanitization
      const cleanEmail = sanitizeInput(email).toLowerCase().trim();
      const cleanFullName = fullName ? sanitizeInput(fullName).replace(/\s+/g, '_') : undefined;
      
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Rate limiting for sign up
      const signUpKey = 'signup-global';
      if (!rateLimiter.isAllowed(signUpKey, 3, 60 * 60 * 1000)) { // 3 attempts per hour
        throw new Error('Too many signup attempts. Please try again later.');
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: cleanFullName ? { full_name: cleanFullName } : undefined,
        }
      });

      return { error };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear any sensitive data from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      await supabase.auth.signOut();
      
      // Reset auth state
      setFailedAttempts(0);
      setIsLocked(false);
      setLockoutTime(0);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const cleanEmail = sanitizeInput(email).toLowerCase().trim();
      
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
    failedAttempts,
    isLocked,
    lockoutTime,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
