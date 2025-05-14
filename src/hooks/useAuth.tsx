
import { useEffect, useState, useContext, createContext, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Define User type that's referenced in other components
export interface User {
  id: string;
  email: string;
  role: string;
  auth_uid: string;
  plan_code?: string;
  plan_expiry_date?: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  userProfile: any;
  userPlan: any;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  getSession: () => Promise<any>;
  checkAuthStatus: () => Promise<boolean>;
  isPremium: () => boolean;
  isAdmin: () => boolean; // Added isAdmin method
  login: (email: string, password: string) => Promise<boolean>; // Added login method
  error: string | null; // Add error field
  refreshUser: () => Promise<void>; // Add refreshUser method
  fetchLatestPlan: () => Promise<void>; // New method to fetch latest plan
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [planRefreshInProgress, setPlanRefreshInProgress] = useState(false);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  
  // Helper function to fetch role from 'users' table - simplified
  const fetchUserRoleFromDb = async (authUid: string, currentSession: any): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_uid', authUid)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        return currentSession?.user?.user_metadata?.role || 'user';
      }
      
      return data?.role || currentSession?.user?.user_metadata?.role || 'user';
    } catch (e) {
      console.error('Exception getting role:', e);
      return 'user';
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Function to calculate expiry date based on plan type
  const calculateExpiryDate = (planCode: string): string => {
    const now = new Date();
    if (planCode === 'pro12' || planCode === 'annual') {
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    } else {
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  };

  useEffect(() => {
    // Simplified auth initialization
    const initializeAuth = async () => {
      if (!isMountedRef.current) return;
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
        }
        
        // Set session state
        if (isMountedRef.current) {
          setSession(initialSession);
          
          // If session exists, update user state
          if (initialSession?.user) {
            const fetchedRole = await fetchUserRoleFromDb(initialSession.user.id, initialSession);
            
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              role: fetchedRole,
              auth_uid: initialSession.user.id,
            });
          }
          
          // Always set loading to false to prevent UI freezes
          setLoading(false);
        }
      } catch (e) {
        console.error('Error in auth initialization:', e);
        // Make sure loading is always set to false even on error
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMountedRef.current) return;
      
      // Update session
      setSession(newSession);
      
      // Update user based on session
      if (newSession?.user) {
        const fetchedRole = await fetchUserRoleFromDb(newSession.user.id, newSession);
        
        setUser({
          id: newSession.user.id,
          email: newSession.user.email || '',
          role: fetchedRole,
          auth_uid: newSession.user.id,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Add a function to fetch latest plan from transactions
  const fetchLatestPlan = useCallback(async () => {
    if (!user?.id || !isMountedRef.current || planRefreshInProgress) return;
    
    try {
      setPlanRefreshInProgress(true);
      
      // Simplified plan fetching
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan_code, auth_uid, plan_expiry_date')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      if (!userError && userData && userData.plan_code) {
        // Check if we already have an expiry date
        let expiryDate = userData.plan_expiry_date;
        
        // If no expiry date, calculate it
        if (!expiryDate) {
          expiryDate = calculateExpiryDate(userData.plan_code);
        }
        
        // Update user with plan information
        setUser(prevUser => prevUser ? {
          ...prevUser,
          plan_code: userData.plan_code,
          plan_expiry_date: expiryDate
        } : null);
        
        // Fetch plan details
        const { data: planData } = await supabase
          .from('plans')
          .select('*')
          .eq('code', userData.plan_code)
          .maybeSingle();
        
        if (planData && isMountedRef.current) {
          setUserPlan(planData);
        }
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      if (isMountedRef.current) {
        setPlanRefreshInProgress(false);
      }
    }
  }, [user, planRefreshInProgress]);
  
  // Helper function to update user's plan code and expiry date - simplified
  const updateUserPlanCode = async (planCode: string, expiryDate: string) => {
    if (!user?.id || !planCode) return;
    
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      if (existingUser) {
        await supabase
          .from('users')
          .update({ 
            plan_code: planCode,
            plan_expiry_date: expiryDate
          })
          .eq('auth_uid', user.id);
      } else {
        await supabase
          .from('users')
          .insert({ 
            auth_uid: user.id, 
            email: user.email, 
            plan_code: planCode,
            plan_expiry_date: expiryDate,
            password: 'oauth-user'
          });
      }
      
      // Update local user state
      setUser(prevUser => prevUser ? { 
        ...prevUser, 
        plan_code: planCode,
        plan_expiry_date: expiryDate
      } : null);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  // Simplified profile fetching
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Simplified plan fetching
  useEffect(() => {
    if (user?.id && !planRefreshInProgress) {
      fetchLatestPlan();
    } else if (!user) {
      setUserPlan(null);
    }
  }, [user, fetchLatestPlan, planRefreshInProgress]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserPlan(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const logout = async () => {
    await signOut();
  };

  const getSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data;
    } catch (error) {
      console.error("Error getting session:", error);
      return { session: null };
    }
  }

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error("Error checking auth:", error);
      return false;
    }
  };

  const isPremium = () => {
    if (!userPlan) return false;
    const planCodeString = userPlan.code || '';
    return planCodeString.includes('premium') || planCodeString.includes('pro');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return !!data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      
      if (refreshedSession?.user) {
        const fetchedRole = await fetchUserRoleFromDb(refreshedSession.user.id, refreshedSession);
        
        setUser({
          id: refreshedSession.user.id,
          email: refreshedSession.user.email || '',
          role: fetchedRole,
          auth_uid: refreshedSession.user.id
        });
        
        setSession(refreshedSession);
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userProfile, 
      userPlan, 
      signOut, 
      logout,
      getSession, 
      checkAuthStatus, 
      isPremium,
      isAdmin,
      login,
      error,
      refreshUser,
      fetchLatestPlan
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
