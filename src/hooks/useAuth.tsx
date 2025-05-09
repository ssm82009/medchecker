import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Fetch user data from users table using auth_uid
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
        } else if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role || 'user',
            plan_code: userData.plan_code,
            auth_uid: userData.auth_uid
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Fetch user data from users table using auth_uid
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
        } else if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role || 'user',
            plan_code: userData.plan_code,
            auth_uid: userData.auth_uid
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user data after successful login using auth_uid
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_uid', data.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role || 'user',
            plan_code: userData.plan_code,
            auth_uid: userData.auth_uid
          });
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user record in users table using auth_uid
      if (data.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            auth_uid: data.user.id,
            email: data.user.email,
            role: 'user',
            plan_code: 'basic',
            password: ''
          });

        if (userError) {
          console.error('Error creating user record:', userError);
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAdmin,
  };
};
