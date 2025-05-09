
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const Login = () => {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await login(email, password);
      if (result && 'error' in result && result.error) {
        throw new Error(result.error.message);
      }
      toast({
        title: t('loginSuccess'),
        description: t('welcomeBack'),
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء تسجيل الدخول');
      toast({
        title: t('loginFailed'),
        description: error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex justify-center items-center min-h-[70vh] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">{t('login')}</CardTitle>
          <CardDescription>{t('login')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {errorMessage && (
              <div className="bg-red-50 p-3 mb-4 border border-red-200 text-red-600 rounded text-center text-sm">
                {errorMessage}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">{t('email')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{t('password')}</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t('forgot')}
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="bg-white"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : t('login')}
            </Button>
            <p className="text-sm text-center text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                {t('register')}
              </Link>
            </p>
            <p className="text-xs text-center text-gray-500">
              {t('continue')}{' '}
              <Link to="/terms" className="hover:underline">
                {t('termsOfUse')}
              </Link>{' '}
              {t('andText')}{' '}
              <Link to="/privacy" className="hover:underline">
                {t('privacyPolicy')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
