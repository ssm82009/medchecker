import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const { login, error, loading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(values.email, values.password);
      if (success) {
        toast({
          title: t('loginSuccess'),
          description: t('welcomeBack'),
        });
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        toast({
          title: t('loginFailed'),
          description: t('invalidCredentials'),
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: t('loginFailed'),
        description: t('invalidCredentials'),
        variant: 'destructive',
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={dir}>
      <Card className="w-full max-w-md border-primary/10 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('login')}</CardTitle>
          <CardDescription className="text-center">{t('adminPanel')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@example.com"
                        className="w-full"
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>{t('password')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="w-full pr-10"
                          required
                        />
                      </FormControl>
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-destructive text-sm">{t('invalidCredentials')}</div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    {t('loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('loginButton')}
                  </span>
                )}
              </Button>
              <Link to="/simple-signup" className="text-center text-primary hover:underline text-sm mt-2">
                {t('noAccount') || 'إنشاء حساب جديد'}
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
