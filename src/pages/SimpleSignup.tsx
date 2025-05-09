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
    // تحقق من عدم وجود المستخدم مسبقًا
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: language === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل' : 'Email already in use', variant: 'destructive' });
      setLoading(false);
      resetCaptcha();
      return;
    }
    // أضف المستخدم
    const { error } = await supabase.from('users').insert({
      email,
      password,
      role: 'user',
      plan_code: 'basic',
    });
    if (!error) {
      toast({ title: language === 'ar' ? 'تم التسجيل' : 'Signup Success', description: language === 'ar' ? 'تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.' : 'Account created successfully. You can now login.' });
      navigate('/login');
    } else {
      toast({ title: language === 'ar' ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
    resetCaptcha();
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