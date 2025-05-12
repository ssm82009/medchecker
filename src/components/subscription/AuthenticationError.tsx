
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { User } from '@/hooks/useAuth';

interface AuthenticationErrorProps {
  language: string;
  user: User | null;
  sessionValid: boolean; // Add sessionValid prop
}

const AuthenticationError: React.FC<AuthenticationErrorProps> = ({ language, user, sessionValid }) => {
  const navigate = useNavigate();
  
  // Determine the message based on user and sessionValid state
  let title = language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required';
  let primaryMessage = language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first';
  let secondaryMessage = language === 'ar' ? 'يجب عليك تسجيل الدخول أو إنشاء حساب جديد للاشتراك في الباقة الاحترافية.' : 'You need to login or create an account to subscribe to the professional plan.';

  if (user && !user.id) {
    primaryMessage = language === 'ar' ? 'بيانات المستخدم غير مكتملة' : 'Incomplete user data';
    secondaryMessage = language === 'ar' ? 'تعذر العثور على معرف المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول.' : 'User ID is missing. Please log out and log in again.';
  } else if (!sessionValid && !user) { // If session is not valid and no user (implies session expired or inactive)
    title = language === 'ar' ? 'الجلسة غير نشطة' : 'Session Inactive';
    primaryMessage = language === 'ar' ? 'انتهت صلاحية جلستك أو أصبحت غير نشطة.' : 'Your session has expired or is inactive.';
    secondaryMessage = language === 'ar' ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة.' : 'Please login again to continue.';
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">
                {primaryMessage}
              </h3>
              <p className="text-amber-700 text-sm">
                {secondaryMessage}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-4">
          <Button 
            className="w-full" 
            onClick={() => navigate('/login', { state: { returnUrl: '/subscribe' } })}
          >
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/signup')}
          >
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthenticationError;
