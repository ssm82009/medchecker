import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast({ title: 'خطأ', description: 'يرجى تعبئة جميع الحقول', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'خطأ', description: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
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
        toast({ title: 'خطأ', description: authError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast({ title: 'خطأ', description: 'فشل إنشاء الحساب', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // تحقق من عدم وجود المستخدم مسبقًا
      const { data: existing, error: existError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        toast({ title: 'خطأ', description: 'البريد الإلكتروني مستخدم بالفعل', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // أضف المستخدم في جدول المستخدمين
      const { error } = await supabase.from('users').insert({
        email,
        password,
        role: 'user',
        plan_code: 'basic',
        auth_uid: authData.user.id // Include the auth_uid from the created auth user
      });

      if (!error) {
        toast({ title: 'تم التسجيل', description: 'تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.' });
        navigate('/login');
      } else {
        toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message || 'حدث خطأ أثناء التسجيل', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md border-primary/10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required />
            <Input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
