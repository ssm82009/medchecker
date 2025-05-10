
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { User } from '@/hooks/useAuth';

interface AuthenticationErrorProps {
  language: string;
  user: User | null;
}

const AuthenticationError: React.FC<AuthenticationErrorProps> = ({ language, user }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start gap-3 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">
                {language === 'ar' 
                  ? user ? 'بيانات المستخدم غير مكتملة' : 'يرجى تسجيل الدخول أولاً'
                  : user ? 'Incomplete user data' : 'Please login first'}
              </h3>
              <p className="text-amber-700 text-sm">
                {language === 'ar' 
                  ? user 
                    ? 'تعذر العثور على معرف المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول.' 
                    : 'يجب عليك تسجيل الدخول أو إنشاء حساب جديد للاشتراك في الباقة الاحترافية.'
                  : user 
                    ? 'User ID is missing. Please log out and log in again.' 
                    : 'You need to login or create an account to subscribe to the professional plan.'}
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
