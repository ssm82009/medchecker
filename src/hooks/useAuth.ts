
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // التحقق من المستخدم عند تحميل الصفحة
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // استخدام نوع التأكيد للتعامل مع مشكلة النوع مع عميل Supabase
      const { data, error } = await supabase
        .from('users')
        .select('email, role, password')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      
      if (error || !data) {
        throw new Error('Invalid email or password');
      }
      
      // حفظ بيانات المستخدم في التخزين المحلي
      const userData: User = {
        email: data.email as string,
        role: data.role as string
      };
      
      setUser(userData);
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
