// c:\projects\medchecker\src\hooks\useAuth.tsx
import React, { useEffect, useState, useContext, createContext, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// User interface with role
export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: () => boolean; // Added isAdmin to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  console.log('[AuthProvider] Initializing. Current state:', { loading, session, user });

  // Listen to Supabase auth state changes
  useEffect(() => {
    console.log('[AuthProvider] useEffect: Setting up onAuthStateChange listener.');
    setLoading(true); // Ensure loading is true when auth state might be changing

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('[AuthProvider] onAuthStateChange event:', _event, 'Session:', session);
        setSession(session);
        if (session?.user) {
          const currentUser: AuthUser = {
            id: session.user.id,
            email: session.user.email,
          };
          setUser(currentUser);
          console.log('[AuthProvider] onAuthStateChange: User set.', currentUser);
        } else {
          setUser(null);
          console.log('[AuthProvider] onAuthStateChange: User set to null.');
        }
        // Set loading to false after initial check or any auth change
        // This ensures loading reflects the current auth resolution status
        setLoading(false); 
      }
    );

    // Check initial session
    const getInitialSession = async () => {
      console.log('[AuthProvider] getInitialSession: Checking for existing session.');
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('[AuthProvider] getInitialSession: Fetched initial session.', initialSession);
        // onAuthStateChange will be triggered if there's an initial session,
        // so we don't need to call setSession/setUser here directly.
        // If no initial session, onAuthStateChange sets session to null and user to null.
        // In all cases, onAuthStateChange will set loading to false.
        if (!initialSession) {
            // If getSession returns null and onAuthStateChange hasn't fired yet (or won't for an initial anonymous state),
            // ensure loading is false.
            setLoading(false);
             console.log('[AuthProvider] getInitialSession: No initial session, ensuring loading is false.');
        }
      } catch (e) {
        console.error('[AuthProvider] getInitialSession: Error fetching session.', e);
        setUser(null);
        setSession(null);
        setLoading(false); // Ensure loading is false on error too
      }
    };

    getInitialSession();

    return () => {
      console.log('[AuthProvider] useEffect cleanup: Unsubscribing from onAuthStateChange.');
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[AuthProvider] login: Attempting login for email:', email);
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AuthProvider] login: Supabase sign-in error.', signInError.message);
        setError(signInError.message);
        setUser(null); // Ensure user is null on error
        setSession(null); // Ensure session is null on error
        setLoading(false);
        return false;
      }

      if (data.session && data.user) {
        console.log('[AuthProvider] login: Supabase sign-in successful. Data:', data);
        // onAuthStateChange will handle setting user and session state, and then loading to false.
        // No need to explicitly set user/session/loading here as onAuthStateChange will fire.
        return true;
      } else {
         console.warn('[AuthProvider] login: Supabase sign-in returned no session/user but no error.');
         setError("Login failed: No session or user returned.");
         setLoading(false);
         return false;
      }
    } catch (e: any) {
      console.error('[AuthProvider] login: Exception during login.', e);
      setError(e.message || 'An unknown error occurred during login.');
      setUser(null);
      setSession(null);
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('[AuthProvider] logout: Initiating sign out.');
    setLoading(true); // Indicate an operation is in progress
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('[AuthProvider] logout: Supabase sign-out error.', signOutError.message);
        setError(signOutError.message);
        // Even on error, onAuthStateChange should ideally reflect the state.
        // If Supabase's local session is cleared, onAuthStateChange handles it.
        // If not, the user might still appear logged in if we don't force state change.
        // However, usually Supabase handles this.
        setLoading(false); // Reset loading if sign out call itself errors
      } else {
        console.log('[AuthProvider] logout: Supabase sign-out successful.');
        // onAuthStateChange will set user and session to null, and loading to false.
        // setUser(null);
        // setSession(null);
      }
    } catch (e: any) {
      console.error('[AuthProvider] logout: Exception during logout.', e);
      setError(e.message || 'An unknown error occurred during logout.');
      setLoading(false); // Reset loading on exception
    }
  };

  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[AuthProvider] State changed: ', { user, session, loading, error });
  }, [user, session, loading, error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        login,
        logout,
        isAdmin, // Added isAdmin here
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
