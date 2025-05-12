
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { useTranslation } from '@/hooks/useTranslation'; 
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation(); 
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading) {
        // فقط تحقق من الصلاحيات عندما تكتمل عملية التحميل
        if (!user) {
          // إذا لم يكن هناك مستخدم مسجل، انتقل إلى صفحة تسجيل الدخول
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log("Current user:", user);
        console.log("User role:", user.role);
        
        // تحقق مما إذا كان دور المستخدم هو مسؤول
        if (user.role !== 'admin') {
          // إذا لم يكن المستخدم مسؤولاً، أظهر رسالة وقم بإعادة التوجيه
          console.log('User is not an admin, redirecting', user);
          
          toast({
            title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
            description: language === 'ar' 
              ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
              : 'You do not have permission to access this page',
            variant: 'destructive'
          });
          
          // إعادة التوجيه إلى الصفحة الرئيسية
          navigate('/');
          return;
        } else {
          console.log('User is admin, access granted');
        }
        
        // اكتمال التحقق من الصلاحيات
        setCheckingPermissions(false);
      }
    };
    
    checkAdminStatus();
  }, [user, loading, navigate, language]);

  // إظهار حالة التحميل أثناء التحقق من الصلاحيات
  if (loading || checkingPermissions) {
    return <div className="text-center py-20">
      {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
    </div>;
  }

  // عرض محتوى لوحة التحكم فقط إذا كان المستخدم مسؤولًا
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
      </h1>
      <p>
        {language === 'ar' 
          ? `مرحباً بك في لوحة التحكم الخاصة بالمسؤولين (${user?.email})` 
          : `Welcome to the admin dashboard (${user?.email})`
        }
      </p>
    </div>
  );
};

export default Dashboard;
