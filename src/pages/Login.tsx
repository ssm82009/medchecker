// c:\projects\medchecker\src\pages\Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Updated import path if necessary
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
  const {
    t,
    dir
  } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // useAuth now returns the simplified context
  const {
    login,
    error: authError,
    loading: authLoading,
    user
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  // Removed loginAttempted, isSubmitting state as authLoading and authError are more direct

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  useEffect(() => {
    console.log('[Login.tsx] useEffect for user state change. User:', user, 'AuthLoading:', authLoading);
    // If user exists and authentication is not loading, redirect
    if (user && !authLoading) {
      const returnUrl = location.state?.returnUrl || '/';
      console.log('[Login.tsx] User detected and auth not loading, navigating to:', returnUrl);
      navigate(returnUrl);
    }
    // If there's no user but auth has finished loading (e.g. initial check done), stay on login.
  }, [user, authLoading, navigate, location.state]);
  const handleSubmit = async (values: LoginFormValues) => {
    if (authLoading) return; // Prevent multiple submissions if auth is already in progress

    console.log('[Login.tsx] handleSubmit: Attempting login with email:', values.email);
    const success = await login(values.email, values.password);
    console.log('[Login.tsx] handleSubmit: Login function call returned. Success:', success);
    if (success) {
      console.log('[Login.tsx] handleSubmit: Login reported as successful by useAuth. User state will update.');
      // Navigation is now handled by the useEffect watching the user and authLoading state.
      toast({
        title: t('loginSuccess'),
        description: t('welcomeBack')
      });
    } else {
      // Error message is now directly from authError, or a generic one if authError is not set.
      console.error('[Login.tsx] handleSubmit: Login failed.');
      toast({
        title: t('loginFailed'),
        description: authError || t('invalidCredentials'),
        // Use authError from useAuth
        variant: 'destructive'
      });
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={dir}>
      <Card className="w-full max-w-md border-primary/10 shadow-lg dark-mode-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('login')}</CardTitle>
          <CardDescription className="text-center"></CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4 bg-[#000a00]/0">
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem className="space-y-2">
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="admin@example.com" className="w-full" required disabled={authLoading} // Use authLoading
                />
                    </FormControl>
                  </FormItem>} className="bg-[#000a00]/0" />
              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem className="space-y-2">
                    <FormLabel>{t('password')}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input {...field} type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pr-10" required disabled={authLoading} // Use authLoading
                  />
                      </FormControl>
                      <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" disabled={authLoading} // Use authLoading
                >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormItem>} />
              {/* Display authError from useAuth if it exists */}
              {authError && <div className="text-destructive text-sm">{authError}</div>}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={authLoading} // Use authLoading
            size="lg">
                {authLoading ? <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loading')}
                  </span> : <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {t('loginButton')}
                  </span>}
              </Button>
              <Link to="/simple-signup" className="text-center text-primary hover:underline text-sm mt-2">
                {t('noAccount')}
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>;
};
export default Login;