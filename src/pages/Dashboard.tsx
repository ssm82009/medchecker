import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // تأكد من استيراد useAuth
import { useTranslation } from '@/hooks/useTranslation'; // إذا كنت بحاجة للترجمة

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation(); // مثال إذا كنت ستعرض رسالة مترجمة

  useEffect(() => {
    if (!loading && !user) {
      // إذا انتهى التحميل ولا يوجد مستخدم مسجل، أعد توجيهه لصفحة تسجيل الدخول
      navigate('/login');
      return;
    }

    if (!loading && user) {
      // تحقق من دور المستخدم بعد التأكد من أن المستخدم وبياناته قد تم تحميلها
      // افترض أن لديك خاصية 'role' في كائن 'user'
      // وأن 'admin' هو الدور الذي يُسمح له بالوصول
      if (user.role !== 'admin') {
        // إذا لم يكن المستخدم "admin"، أعد توجيهه إلى صفحة "حسابي"
        navigate('/my-account'); // <--- تم التعديل هنا
        // يمكنك إظهار رسالة للمستخدم قبل إعادة التوجيه إذا أردت
        // toast.error(language === 'ar' ? 'ليس لديك صلاحية الوصول لهذه الصفحة، تم توجيهك لحسابك' : 'You do not have permission to access this page, redirecting to your account.');
      }
    }
  }, [user, loading, navigate, language]);

  // إذا كان التحميل جاريًا أو إذا تم بالفعل بدء إعادة التوجيه، لا تعرض شيئًا مؤقتًا
  if (loading || (user && user.role !== 'admin')) {
    // يمكنك عرض مؤشر تحميل هنا إذا أردت
    return <div className="text-center py-20">{language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}</div>;
  }

  // إذا كان المستخدم "admin"، اعرض محتوى لوحة التحكم
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
      </h1>
      {/* ... باقي محتوى لوحة التحكم هنا ... */}
      <p>{language === 'ar' ? 'مرحباً بك في لوحة التحكم الخاصة بالمسؤولين.' : 'Welcome to the admin dashboard.'}</p>
    </div>
  );
};

export default Dashboard;