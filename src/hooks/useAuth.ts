
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        throw new Error('Invalid email or password');
      }
      
      setUser({ email: data.email, role: data.role });
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return { user, login, logout, loading, error, isAdmin };
};
