
import { useEffect, useState, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

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

  // Add a function to fetch latest plan from transactions
  const fetchLatestPlan = async () => {
    if (!user?.id) return;
    
    try {
      console.log("Fetching latest plan for user:", user.id);
      
      // First try to get the user's plan from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan_code, auth_uid')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      // If we found plan data in the users table, update user and fetch plan details
      if (!userError && userData && userData.plan_code) {
        console.log("Found plan in users table:", userData.plan_code);
        
        // Update user object with plan_code
        setUser(prevUser => prevUser ? { ...prevUser, plan_code: userData.plan_code } : null);
        
        // Fetch plan details
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('code', userData.plan_code)
          .maybeSingle();
        
        if (!planError && planData) {
          setUserPlan(planData);
          console.log("Set user plan from users table:", planData);
          return;
        }
      }
      
      // If we didn't find or couldn't set plan from users table, check transactions
      console.log("Checking latest plan from transactions...");
      
      // Get the latest completed transaction
      const { data: txnData, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (txnError) {
        console.error("Error fetching transactions:", txnError);
        return;
      }
      
      // If no transactions found by ID, try looking by email in metadata
      if (!txnData || txnData.length === 0) {
        console.log("No transactions found by ID, checking metadata...");
        
        const { data: metadataTransactions, error: metadataError } = await supabase
          .from('transactions')
          .select('*')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!metadataError && metadataTransactions) {
          // Filter transactions by user email in metadata using safe access
          const userTransactions = metadataTransactions.filter(tx => {
            // Safely check if metadata exists and has user_email or payer.email_address property
            if (tx.metadata && typeof tx.metadata === 'object') {
              // Check if user_email exists in metadata
              const metadataObj = tx.metadata as Record<string, any>;
              
              // Check for direct user_email property
              if (typeof metadataObj.user_email === 'string' && metadataObj.user_email === user.email) {
                return true;
              }
              
              // Check for payer.email_address property
              if (metadataObj.payer && typeof metadataObj.payer === 'object' && 
                  typeof metadataObj.payer.email_address === 'string' && 
                  metadataObj.payer.email_address === user.email) {
                return true;
              }
            }
            return false;
          });
          
          if (userTransactions.length > 0) {
            console.log("Found transactions in metadata:", userTransactions[0]);
            
            // Get plan code from latest transaction and update user
            const latestPlanCode = userTransactions[0].plan_code;
            
            // Update user record with plan code if needed
            await updateUserPlanCode(latestPlanCode);
            
            // Fetch plan details
            const { data: planData, error: planError } = await supabase
              .from('plans')
              .select('*')
              .eq('code', latestPlanCode)
              .maybeSingle();
            
            if (!planError && planData) {
              setUserPlan(planData);
              console.log("Set user plan from transaction metadata:", planData);
            }
          }
        }
        return;
      }
      
      // Get plan code from latest transaction and update user
      const latestTransaction = txnData[0];
      const latestPlanCode = latestTransaction.plan_code;
      
      console.log("Latest transaction found with plan:", latestPlanCode);
      
      // Update user record with plan code if needed
      await updateUserPlanCode(latestPlanCode);
      
      // Fetch plan details
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('code', latestPlanCode)
        .maybeSingle();
      
      if (!planError && planData) {
        setUserPlan(planData);
        console.log("Set user plan from transactions:", planData);
      }
    } catch (error) {
      console.error("Error in fetchLatestPlan:", error);
    }
  };
  
  // Helper function to update user's plan code
  const updateUserPlanCode = async (planCode: string) => {
    if (!user?.id || !planCode) return;
    
    try {
      // Check if user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, plan_code')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking user:", checkError);
        return;
      }
      
      if (existingUser) {
        // Update existing record if plan_code is different
        if (existingUser.plan_code !== planCode) {
          console.log("Updating user plan_code from", existingUser.plan_code, "to", planCode);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ plan_code: planCode })
            .eq('auth_uid', user.id);
          
          if (updateError) {
            console.error("Error updating user plan:", updateError);
          } else {
            console.log("User plan_code updated successfully");
            // Update local user state
            setUser(prevUser => prevUser ? { ...prevUser, plan_code: planCode } : null);
          }
        }
      } else {
        // Insert new user record if it doesn't exist
        console.log("Creating new user record with plan_code:", planCode);
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({ 
            auth_uid: user.id, 
            email: user.email, 
            plan_code: planCode,
            password: 'oauth-user' // placeholder for OAuth users
          });
        
        if (insertError) {
          console.error("Error inserting user plan:", insertError);
        } else {
          console.log("User record created with plan_code");
          // Update local user state
          setUser(prevUser => prevUser ? { ...prevUser, plan_code: planCode } : null);
        }
      }
    } catch (error) {
      console.error("Error in updateUserPlanCode:", error);
    }
  };

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

  // This effect runs when user profile changes to fetch the plan
  useEffect(() => {
    if (user?.id) {
      fetchLatestPlan();
    } else {
      setUserPlan(null);
    }
  }, [user]);

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
        
        // Re-fetch user profile and plan
        await fetchLatestPlan();
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
