import { useEffect, useState, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  userProfile: any;
  userPlan: any;
  signOut: () => Promise<void>;
  getSession: () => Promise<any>;
  checkAuthStatus: () => Promise<boolean>;
  isPremium: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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

  return (
    <AuthContext.Provider value={{ user, session, loading, userProfile, userPlan, signOut, getSession, checkAuthStatus, isPremium }}>
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
