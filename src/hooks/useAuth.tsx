
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

// تعريف واجهة المستخدم هنا بدلاً من استيرادها
export interface User {
  id?: string;
  email: string;
  role: string;
  plan_code?: string;
  is_active?: boolean;
  auth_uid?: string; // إضافة معرف المصادقة للتحقق من سياسات الوصول
}

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // التحقق من المستخدم عند تحميل الصفحة
  useEffect(() => {
    // تهيئة حالة المصادقة من localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('خطأ في تحليل بيانات المستخدم المخزنة:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // استعلام للعثور على المستخدم بالبريد الإلكتروني وكلمة المرور المتطابقين
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_uid, email, role, password, plan_code')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error('خطأ في استعلام تسجيل الدخول:', error);
        throw new Error('خطأ في التحقق من بيانات الاعتماد');
      }
      
      if (!data) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
      
      // حفظ بيانات المستخدم في localStorage
      const userData: User = {
        id: String(data.id), // تحويل المعرف إلى نص ليتوافق مع واجهة المستخدم
        email: data.email,
        role: data.role,
        plan_code: data.plan_code || 'visitor',
        is_active: true, // تعيين قيمة افتراضية لأن العمود غير موجود حاليًا
        auth_uid: data.auth_uid || null,
      };
      
      console.log("تم تسجيل الدخول بنجاح:", userData);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('خطأ في تسجيل الدخول:', err);
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    console.log("التحقق من صلاحيات المشرف للمستخدم:", user);
    return user?.role === 'admin';
  };

  return { user, login, logout, loading, error, isAdmin };
};
