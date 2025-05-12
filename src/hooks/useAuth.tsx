import { useEffect, useState, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Define User type that's referenced in other components
export interface User {
  id: string;
  email: string;
  auth_uid?: string;
  role?: string;
  plan_code?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'user'
      } : null);
      setLoading(false);
    };

    getInitialSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'user'
      } : null);
    });
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (userProfile) {
        try {
          const { data: userDetails, error } = await supabase
            .from('users')
            .select('plan_code')
            .eq('auth_uid', userProfile.id)
            .single();
          
          if (error) {
            console.error('Error fetching user plan:', error);
            setUserPlan(null);
          } else {
            const planCode = userDetails?.plan_code;
            if (planCode) {
              const { data: planData, error: planError } = await supabase
                .from('plans')
                .select('*')
                .eq('code', planCode)
                .single();
              
              if (planError) {
                console.error('Error fetching plan details:', planError);
                setUserPlan(null);
              } else {
                setUserPlan(planData);
              }
            } else {
              setUserPlan(null);
            }
          }
        } catch (error) {
          console.error('Unexpected error fetching user plan:', error);
          setUserPlan(null);
        }
      } else {
        setUserPlan(null);
      }
    };

    fetchUserPlan();
  }, [userProfile]);

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

  // Alias for signOut for consistency with component usage
  const logout = async () => {
    await signOut();
  };

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log("Error getting session", error);
    }
    return data;
  }

  const checkAuthStatus = async (): Promise<boolean> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
    return !!session?.user;
  };

  const isPremium = () => {
    if (!userPlan) return false;
    const planCodeString = userPlan.code || '';
    
    // Fix: Remove toString() since planCodeString is already a string
    return planCodeString.includes('premium') || planCodeString.includes('pro');
  };

  // Add isAdmin method that's being used in components
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'admin';
  };

  // Add login method that's being used in Login.tsx
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        return false;
      }

      return !!data.user;
    } catch (err) {
      console.error("Login exception:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    }
  };

  // Add refreshUser method that's being used in useSubscription.tsx
  const refreshUser = async (): Promise<void> => {
    try {
      // Refresh the session
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      
      if (refreshedSession?.user) {
        // Update user state
        setSession(refreshedSession);
        setUser({
          id: refreshedSession.user.id,
          email: refreshedSession.user.email || '',
          role: refreshedSession.user.user_metadata?.role || 'user'
        });
        
        // Re-fetch user profile and plan if needed
        if (refreshedSession.user.id) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', refreshedSession.user.id)
              .single();
              
            if (profile) {
              setUserProfile(profile);
            }
            
            // Fetch updated plan information
            const { data: userDetails } = await supabase
              .from('users')
              .select('plan_code')
              .eq('auth_uid', refreshedSession.user.id)
              .single();
              
            if (userDetails?.plan_code) {
              const { data: planData } = await supabase
                .from('plans')
                .select('*')
                .eq('code', userDetails.plan_code)
                .single();
                
              if (planData) {
                setUserPlan(planData);
              }
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
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
      refreshUser
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
