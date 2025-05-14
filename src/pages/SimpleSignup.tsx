
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const SimpleSignup: React.FC = () => {
  const { language } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // كود التحقق
  const [a, setA] = useState(getRandomInt(1, 10));
  const [b, setB] = useState(getRandomInt(1, 10));
  const [captcha, setCaptcha] = useState('');

  const resetCaptcha = () => {
    setA(getRandomInt(1, 10));
    setB(getRandomInt(1, 10));
    setCaptcha('');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !captcha) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'يرجى تعبئة جميع الحقول' : 'Please fill all fields', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (parseInt(captcha) !== a + b) {
      toast({ title: language === 'ar' ? 'خطأ في التحقق' : 'Captcha Error', description: language === 'ar' ? 'إجابة كود التحقق غير صحيحة' : 'Captcha answer is incorrect', variant: 'destructive' });
      resetCaptcha();
      return;
    }
    setLoading(true);
    
    try {
      // First, create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) {
        toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: authError.message, variant: 'destructive' });
        setLoading(false);
        resetCaptcha();
        return;
      }

      if (!authData.user) {
        toast({ 
          title: language === 'ar' ? 'خطأ' : 'Error', 
          description: language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account', 
          variant: 'destructive' 
        });
        setLoading(false);
        resetCaptcha();
        return;
      }

      // Here we use service role key for inserting into users table (bypassing RLS)
      // This will be handled through a server-side function or trigger in production
      // For development purposes, we do it directly here
      const { error } = await supabase.from('users').insert({
        auth_uid: authData.user.id,
        email,
        password, // Note: Consider encrypting this for production
        role: 'user',
        plan_code: 'basic'
      });
      
      // Even if there's an error with the additional user data, the auth account is created
      if (error) {
        console.error('Error creating user record:', error);
        // Don't block signup if user table insertion fails (this is just supplementary data)
        toast({ 
          title: language === 'ar' ? 'تم التسجيل بنجاح' : 'Signup Success', 
          description: language === 'ar' ? 'تم إنشاء الحساب ولكن قد تكون هناك بعض البيانات الناقصة. يمكنك تسجيل الدخول الآن.' : 'Account created successfully, but some user data might be missing. You can now login.',
        });
      } else {
        toast({ 
          title: language === 'ar' ? 'تم التسجيل' : 'Signup Success', 
          description: language === 'ar' ? 'تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.' : 'Account created successfully. You can now login.' 
        });
      }
      navigate('/login');
    } catch (err: any) {
      toast({ 
        title: language === 'ar' ? 'خطأ' : 'Error', 
        description: err.message || (language === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'An error occurred during signup'), 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {language === 'ar' ? 'تسجيل حساب جديد' : 'Create New Account'}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <Input type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'} value={password} onChange={e => setPassword(e.target.value)} required />
            <Input type="password" placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {language === 'ar' ? `كم حاصل جمع ${a} + ${b}؟` : `What is ${a} + ${b}?`}
              </span>
              <Input type="number" className="w-24" value={captcha} onChange={e => setCaptcha(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (language === 'ar' ? 'جاري التسجيل...' : 'Signing up...') : (language === 'ar' ? 'تسجيل' : 'Sign Up')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SimpleSignup;
