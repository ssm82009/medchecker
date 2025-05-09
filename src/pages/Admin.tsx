
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Json } from '@/integrations/supabase/types';
import { PlanType } from '../types/plan';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings, UserCog, Layers, Users, Image as ImageIcon, BadgeDollarSign, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { User, PaymentType } from '@/types';

const adminSections = [
  { key: 'ai', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { key: 'logo', label: 'إعدادات الشعار', icon: ImageIcon },
  { key: 'ad', label: 'الإعلانات', icon: BadgeDollarSign },
  { key: 'plans', label: 'الخطط', icon: Layers },
  { key: 'users', label: 'إدارة الأعضاء', icon: Users },
  { key: 'paypal', label: 'بوابة الدفع بايبال', icon: CreditCard },
];

type PaypalMode = 'sandbox' | 'live';

// تحويل من قاعدة البيانات إلى PlanType (camelCase)
function dbToPlanType(dbPlan: any): PlanType {
  return {
    id: dbPlan.id,
    code: dbPlan.code,
    name: dbPlan.name,
    nameAr: dbPlan.name_ar,
    description: dbPlan.description,
    descriptionAr: dbPlan.description_ar,
    price: dbPlan.price,
    features: dbPlan.features,
    featuresAr: dbPlan.features_ar,
    isDefault: dbPlan.is_default,
  };
}

// تحويل من PlanType إلى قاعدة البيانات (snake_case)
function planTypeToDb(plan: PlanType): any {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    name_ar: plan.nameAr,
    description: plan.description,
    description_ar: plan.descriptionAr,
    price: plan.price,
    features: plan.features,
    features_ar: plan.featuresAr,
    is_default: plan.isDefault,
  };
}

const Admin: React.FC = () => {
  const { t, dir } = useTranslation();
  const { toast } = useToast();
  const { user, isAdmin, loading: userLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [adHTML, setAdHTML] = useState('');
  const [secondaryAdHTML, setSecondaryAdHTML] = useState('');
  const [logoText, setLogoText] = useState('دواء آمن');
  const [logoTextInput, setLogoTextInput] = useState('');
  
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanType | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<PlanType>>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: 0,
    features: [],
    featuresAr: [],
    code: '',
    isDefault: false,
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlanData, setEditPlanData] = useState<(Omit<PlanType, 'features' | 'featuresAr'> & { features: string; featuresAr: string }) | null>(null);
  const [addPlanData, setAddPlanData] = useState<Omit<PlanType, 'id' | 'features' | 'featuresAr'> & { features: string; featuresAr: string }>({
    code: '',
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: 0,
    features: '',
    featuresAr: '',
    isDefault: false,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [plansList, setPlansList] = useState<Pick<PlanType, 'code' | 'name' | 'nameAr'>[]>([]);
  
  const [activeSection, setActiveSection] = useState('ai');
  
  const [paypalMode, setPaypalMode] = useState<PaypalMode>('sandbox');
  const [sandboxClientId, setSandboxClientId] = useState('');
  const [sandboxSecret, setSandboxSecret] = useState('');
  const [liveClientId, setLiveClientId] = useState('');
  const [liveSecret, setLiveSecret] = useState('');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSettingsId, setPaypalSettingsId] = useState<string | null>(null);
  
  // حفظ إعدادات الذكاء الاصطناعي
  const saveAISettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'ai_settings',
          value: { apiKey, model } as Json
        }, { onConflict: 'type' });
      if (error) throw error;
      toast({ title: t('saveSuccess'), description: t('settingsSaved'), duration: 3000 });
    } catch (error) {
      toast({ title: t('error'), description: String(error), variant: 'destructive', duration: 5000 });
    }
  };

  // حفظ نص الشعار
  const saveLogo = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ type: 'logo_text', value: logoTextInput as Json }, { onConflict: 'type' });
      if (error) throw error;
      setLogoText(logoTextInput);
      toast({ title: t('saveSuccess'), description: t('logoSaved'), duration: 3000 });
    } catch (error) {
      toast({ title: t('error'), description: String(error), variant: 'destructive', duration: 5000 });
    }
  };

  // حفظ الإعلان الرئيسي
  const saveAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ type: 'advertisement', value: adHTML as Json }, { onConflict: 'type' });
      if (error) throw error;
      toast({ title: t('saveSuccess'), description: t('adSaved'), duration: 3000 });
    } catch (error) {
      toast({ title: t('error'), description: String(error), variant: 'destructive', duration: 5000 });
    }
  };

  // حفظ الإعلان الثانوي
  const saveSecondaryAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ type: 'secondary_advertisement', value: secondaryAdHTML as Json }, { onConflict: 'type' });
      if (error) throw error;
      toast({ title: t('saveSuccess'), description: t('secondaryAdSaved'), duration: 3000 });
    } catch (error) {
      toast({ title: t('error'), description: String(error), variant: 'destructive', duration: 5000 });
    }
  };

  // Save PayPal settings
  const savePaypalSettings = async () => {
    setSavingPaypal(true);
    try {
      const paypalData = {
        id: paypalSettingsId || undefined,
        mode: paypalMode,
        sandbox_client_id: sandboxClientId,
        sandbox_secret: sandboxSecret,
        live_client_id: liveClientId,
        live_secret: liveSecret,
        currency: 'USD',
        payment_type: 'one_time' as PaymentType
      };

      if (paypalSettingsId) {
        await supabase.from('paypal_settings').update(paypalData).eq('id', paypalSettingsId);
      } else {
        await supabase.from('paypal_settings').insert(paypalData);
      }
      
      toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات PayPal بنجاح', duration: 3000 });
    } catch (error) {
      toast({ title: 'خطأ', description: String(error), variant: 'destructive', duration: 5000 });
    } finally {
      setSavingPaypal(false);
    }
  };

  // تحديث هيكل الخطط
  const updatePlansToNewStructure = async () => {
    try {
      await supabase.from('plans').update({ is_default: false }).neq('code', 'basic');
      await supabase.from('plans').upsert(planTypeToDb({
        code: 'visitor',
        name: 'Visitor Plan',
        nameAr: 'باقة الزائر',
        description: 'Basic features for unregistered users',
        descriptionAr: 'ميزات أساسية للمستخدمين غير المسجلين',
        price: 0,
        features: ['Check up to 2 medications', 'Basic interaction analysis'],
        featuresAr: ['فحص حتى دوائين', 'تحليل أساسي للتفاعلات'],
        isDefault: false
      }));
      await supabase.from('plans').upsert(planTypeToDb({
        code: 'basic',
        name: 'Basic Plan',
        nameAr: 'الباقة الأساسية',
        description: 'Free basic plan for registered users',
        descriptionAr: 'الباقة الأساسية المجانية للمستخدمين المسجلين',
        price: 0,
        features: ['Check up to 5 medications', 'Basic interaction analysis'],
        featuresAr: ['فحص حتى 5 أدوية', 'تحليل أساسي للتفاعلات'],
        isDefault: true
      }));
      await supabase.from('plans').upsert(planTypeToDb({
        code: 'pro',
        name: 'Professional Plan',
        nameAr: 'الباقة الاحترافية',
        description: 'Advanced features for healthcare professionals',
        descriptionAr: 'مميزات متقدمة للمهنيين الصحيين',
        price: 9.99,
        features: ['Check up to 10 medications', 'Advanced interaction analysis', 'Image-based medication search', 'Patient medication history'],
        featuresAr: ['فحص حتى 10 أدوية', 'تحليل متقدم للتفاعلات', 'البحث عن الأدوية بالصور', 'سجل أدوية المريض'],
        isDefault: false
      }));
      toast({ title: 'تم التحديث', description: 'تم تحديث الخطط بنجاح', duration: 3000 });
      fetchPlans();
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء تحديث الخطط', variant: 'destructive', duration: 5000 });
    }
  };

  // حذف خطة
  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخطة؟')) return;
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (!error) {
      toast({ title: 'تم الحذف', description: 'تم حذف الخطة' });
      fetchPlans();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  // تغيير باقة المستخدم
  const handleChangePlan = async (userId: string, newPlan: string) => {
    const { error } = await supabase.from('users').update({ plan_code: newPlan }).eq('id', userId);
    if (!error) {
      toast({ title: 'تم التحديث', description: 'تم تغيير الباقة للمستخدم' });
      fetchUsers();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      toast({ title: 'تم الحذف', description: 'تم حذف المستخدم' });
      fetchUsers();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  // تحديث دالة handlePaypalModeChange لمعالجة نوع البيانات بشكل صحيح
  const handlePaypalModeChange = (value: string) => {
    // نتحقق من أن القيمة هي إما "sandbox" أو "live" قبل تعيينها
    if (value === "sandbox" || value === "live") {
      setPaypalMode(value);
    }
  };

  // Handle adding a plan
  const handleAddPlan = async () => {
    try {
      const featuresArray = addPlanData.features.split('\n').filter(Boolean);
      const featuresArArray = addPlanData.featuresAr.split('\n').filter(Boolean);
      
      const newPlan = {
        code: addPlanData.code,
        name: addPlanData.name,
        name_ar: addPlanData.nameAr,
        description: addPlanData.description,
        description_ar: addPlanData.descriptionAr,
        price: Number(addPlanData.price),
        features: featuresArray,
        features_ar: featuresArArray,
        is_default: addPlanData.isDefault
      };
      
      const { error } = await supabase.from('plans').insert(newPlan);
      
      if (error) throw error;
      
      setShowAddModal(false);
      fetchPlans();
      
      toast({ 
        title: 'تمت الإضافة', 
        description: 'تمت إضافة الخطة بنجاح',
        duration: 3000
      });
    } catch (error) {
      toast({ 
        title: 'خطأ', 
        description: String(error), 
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  // Handle editing a plan
  const openEditModal = (plan: PlanType) => {
    setEditPlanData({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      featuresAr: Array.isArray(plan.featuresAr) ? plan.featuresAr.join('\n') : ''
    });
    setShowEditModal(true);
  };

  // Handle save edit plan
  const handleEditPlan = async () => {
    if (!editPlanData) return;
    
    try {
      const featuresArray = editPlanData.features.split('\n').filter(Boolean);
      const featuresArArray = editPlanData.featuresAr.split('\n').filter(Boolean);
      
      const updatedPlan = {
        id: editPlanData.id,
        code: editPlanData.code,
        name: editPlanData.name,
        name_ar: editPlanData.nameAr,
        description: editPlanData.description,
        description_ar: editPlanData.descriptionAr,
        price: Number(editPlanData.price),
        features: featuresArray,
        features_ar: featuresArArray,
        is_default: editPlanData.isDefault
      };
      
      const { error } = await supabase
        .from('plans')
        .update(updatedPlan)
        .eq('id', editPlanData.id);
      
      if (error) throw error;
      
      setShowEditModal(false);
      fetchPlans();
      
      toast({ 
        title: 'تم التحديث', 
        description: 'تم تحديث الخطة بنجاح',
        duration: 3000
      });
    } catch (error) {
      toast({ 
        title: 'خطأ', 
        description: String(error), 
        variant: 'destructive',
        duration: 5000
      });
    }
  };
  
  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
    if (!error && data) setPlans(data.map(dbToPlanType));
    setLoadingPlans(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  }, []);

  const fetchPlansList = useCallback(async () => {
    const { data, error } = await supabase.from('plans').select('code, name, name_ar');
    if (!error && data) setPlansList(data.map((p: any) => ({ code: p.code, name: p.name, nameAr: p.name_ar })));
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
    fetchPlansList();
  }, [fetchPlans, fetchUsers, fetchPlansList]);
  
  // Combine all fetch operations into a single initialization function
  const initializeDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Check if user is admin
      if (!user || !isAdmin()) {
        throw new Error('Unauthorized access');
      }

      // Fetch all settings in parallel
      const [
        aiSettings,
        adSettings,
        logoSettings,
        plansData,
        usersData,
        plansListData,
        paypalSettings
      ] = await Promise.all([
        supabase.from('settings').select('value').eq('type', 'ai_settings').maybeSingle(),
        supabase.from('settings').select('value').eq('type', 'advertisement').maybeSingle(),
        supabase.from('settings').select('value').eq('type', 'logo_text').maybeSingle(),
        supabase.from('plans').select('*').order('price', { ascending: true }),
        supabase.from('users').select('*').order('id', { ascending: true }),
        supabase.from('plans').select('code, name, name_ar'),
        supabase.from('paypal_settings').select('*').single()
      ]);

      // Process AI settings
      if (aiSettings.data?.value) {
        const value = aiSettings.data.value;
        if (typeof value === 'object' && !Array.isArray(value)) {
          setApiKey(String(value.apiKey || ''));
          setModel(String(value.model || 'gpt-4o-mini'));
        }
      }

      // Process ad settings
      if (adSettings.data?.value) {
        setAdHTML(typeof adSettings.data.value === 'string' ? adSettings.data.value : '');
      }
      if (adSettings.data?.value) {
        setSecondaryAdHTML(typeof adSettings.data.value === 'string' ? adSettings.data.value : '');
      }

      // Process logo settings
      if (logoSettings.data?.value) {
        const text = typeof logoSettings.data.value === 'string' ? logoSettings.data.value : 'دواء آمن';
        setLogoText(text);
        setLogoTextInput(text);
      }

      // Process plans
      if (plansData.data) {
        setPlans(plansData.data.map(dbToPlanType));
      }

      // Process users
      if (usersData.data) {
        setUsers(usersData.data);
      }

      // Process plans list
      if (plansListData.data) {
        setPlansList(plansListData.data.map((p: any) => ({ code: p.code, name: p.name, nameAr: p.name_ar })));
      }

      // Process PayPal settings
      if (paypalSettings.data) {
        setPaypalSettingsId(paypalSettings.data.id);
        setPaypalMode((paypalSettings.data.mode as PaypalMode) || 'sandbox');
        setSandboxClientId(paypalSettings.data.sandbox_client_id || '');
        setSandboxSecret(paypalSettings.data.sandbox_secret || '');
        setLiveClientId(paypalSettings.data.live_client_id || '');
        setLiveSecret(paypalSettings.data.live_secret || '');
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      toast({
        title: t('error'),
        description: t('contentFetchError'),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t, user, isAdmin]);

  // Initialize dashboard only after user loading is done
  useEffect(() => {
    if (!userLoading) {
      initializeDashboard();
    }
  }, [userLoading, initializeDashboard]);

  // Show loading if user is still loading
  if (userLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('error')}</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!user || !isAdmin()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('unauthorized')}</h2>
          <p className="text-gray-600">{t('adminAccessRequired')}</p>
        </div>
      </div>
    );
  }

  // Show dashboard content
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r shadow-lg flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xl font-bold mb-6 text-primary">لوحة المشرف</h2>
        {adminSections.map(section => (
          <button
            key={section.key}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-base font-medium mb-1 hover:bg-primary/10 ${activeSection === section.key ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700'}`}
            onClick={() => setActiveSection(section.key)}
          >
            <section.icon className="w-5 h-5" />
            {section.label}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'ai' && (
          <Card className="mb-8">
            <CardHeader><CardTitle>{t('aiSettings')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t('apiKey')}</Label>
                  <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">{t('model')}</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveAISettings}>{t('saveSettings')}</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activeSection === 'logo' && (
          <Card className="mb-8">
            <CardHeader><CardTitle>{t('logoSettings')}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoText">{t('logoText')}</Label>
                  <Input id="logoText" type="text" value={logoTextInput} onChange={(e) => setLogoTextInput(e.target.value)} placeholder="دواء آمن" />
                </div>
                <Button onClick={saveLogo}>{t('saveLogo')}</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {activeSection === 'ad' && (
          <>
            <Card className="mb-8">
              <CardHeader><CardTitle>{t('advertisement')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea value={adHTML} onChange={(e) => setAdHTML(e.target.value)} placeholder="<div>Your ad HTML here</div>" className="min-h-[120px] font-mono" />
                  <Button onClick={saveAd}>{t('saveAd')}</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="mb-8">
              <CardHeader><CardTitle>{t('secondaryAdvertisement')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea value={secondaryAdHTML} onChange={(e) => setSecondaryAdHTML(e.target.value)} placeholder="<div>Your secondary ad HTML here</div>" className="min-h-[120px] font-mono" />
                  <Button onClick={saveSecondaryAd}>{t('saveSecondaryAd')}</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {activeSection === 'plans' && (
          <Card className="mb-8">
            <CardHeader><CardTitle>Subscription Plans</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4 gap-2">
                <Button onClick={updatePlansToNewStructure} variant="outline">تحديث هيكل الخطط</Button>
                <Button onClick={() => setShowAddModal(true)}>إضافة خطة</Button>
              </div>
              {loadingPlans ? (
                <div>Loading...</div>
              ) : (
                <table className="w-full text-sm border rounded-lg overflow-hidden shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>Code</th>
                      <th>Name</th>
                      <th>Arabic Name</th>
                      <th>Price ($)</th>
                      <th>Features</th>
                      <th>Features (Ar)</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map(plan => (
                      <tr key={plan.id} className="border-b hover:bg-gray-50">
                        <td>{plan.code}</td>
                        <td>{plan.name}</td>
                        <td>{plan.nameAr}</td>
                        <td>{plan.price}</td>
                        <td><ul>{plan.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></td>
                        <td><ul>{plan.featuresAr?.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></td>
                        <td>
                          <Button size="sm" onClick={() => openEditModal(plan)}>تعديل</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>حذف</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
        {activeSection === 'users' && (
          <Card className="mb-8">
            <CardHeader><CardTitle>إدارة الأعضاء</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2 items-center">
                <Input placeholder="بحث بالبريد الإلكتروني" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                <Button onClick={fetchUsers}>تحديث</Button>
              </div>
              {loadingUsers ? (
                <div>جاري التحميل...</div>
              ) : (
                <table className="w-full text-sm border rounded-lg overflow-hidden shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>البريد الإلكتروني</th>
                      <th>الدور</th>
                      <th>الباقة</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.email.includes(searchEmail)).map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <select value={user.plan_code || 'visitor'} onChange={e => handleChangePlan(user.id, e.target.value)} className="border rounded px-2 py-1">
                            {plansList.map(plan => (
                              <option key={plan.code} value={plan.code}>{plan.nameAr || plan.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>حذف</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
        {activeSection === 'paypal' && (
          <Card className="mb-8 max-w-xl mx-auto">
            <CardHeader><CardTitle>إعدادات بوابة الدفع بايبال</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">وضع التشغيل</label>
                  <select
                    value={paypalMode}
                    onChange={(e) => handlePaypalModeChange(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="sandbox">Sandbox (اختبار)</option>
                    <option value="live">Live (مباشر)</option>
                  </select>
                </div>
                {paypalMode === 'sandbox' ? (
                  <>
                    <div>
                      <label className="block mb-1 font-medium">Sandbox Client ID</label>
                      <input type="text" className="w-full p-2 border rounded" value={sandboxClientId} onChange={e => setSandboxClientId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Sandbox Secret</label>
                      <input type="password" className="w-full p-2 border rounded" value={sandboxSecret} onChange={e => setSandboxSecret(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block mb-1 font-medium">Live Client ID</label>
                      <input type="text" className="w-full p-2 border rounded" value={liveClientId} onChange={e => setLiveClientId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Live Secret</label>
                      <input type="password" className="w-full p-2 border rounded" value={liveSecret} onChange={e => setLiveSecret(e.target.value)} />
                    </div>
                  </>
                )}
                <div>
                  <label className="block mb-1 font-medium">العملة</label>
                  <input type="text" className="w-full p-2 border rounded bg-gray-100" value="USD" disabled />
                </div>
                <button
                  onClick={savePaypalSettings}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  disabled={savingPaypal}
                >
                  {savingPaypal ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Dialogs for plans (add/edit) remain as before */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة خطة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-2">
              <Input placeholder="رمز الخطة (مثال: visitor)" value={addPlanData.code} onChange={e => setAddPlanData({ ...addPlanData, code: e.target.value })} />
              <Input placeholder="اسم الخطة" value={addPlanData.name} onChange={e => setAddPlanData({ ...addPlanData, name: e.target.value })} />
              <Input placeholder="الاسم بالعربية" value={addPlanData.nameAr} onChange={e => setAddPlanData({ ...addPlanData, nameAr: e.target.value })} />
              <Input placeholder="الوصف" value={addPlanData.description} onChange={e => setAddPlanData({ ...addPlanData, description: e.target.value })} />
              <Input placeholder="الوصف بالعربية" value={addPlanData.descriptionAr} onChange={e => setAddPlanData({ ...addPlanData, descriptionAr: e.target.value })} />
              <Input type="number" placeholder="السعر" value={addPlanData.price} onChange={e => setAddPlanData({ ...addPlanData, price: Number(e.target.value) })} />
              <Textarea placeholder="المميزات (سطر لكل ميزة)" value={addPlanData.features} onChange={e => setAddPlanData({ ...addPlanData, features: e.target.value })} />
              <Textarea placeholder="المميزات بالعربية (سطر لكل ميزة)" value={addPlanData.featuresAr} onChange={e => setAddPlanData({ ...addPlanData, featuresAr: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={handleAddPlan}>إضافة</Button>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>تعديل الخطة</DialogTitle></DialogHeader>
            {editPlanData && (
              <div className="space-y-2">
                <Input placeholder="رمز الخطة" value={editPlanData.code} onChange={e => setEditPlanData({ ...editPlanData, code: e.target.value })} />
                <Input placeholder="اسم الخطة" value={editPlanData.name} onChange={e => setEditPlanData({ ...editPlanData, name: e.target.value })} />
                <Input placeholder="الاسم بالعربية" value={editPlanData.nameAr} onChange={e => setEditPlanData({ ...editPlanData, nameAr: e.target.value })} />
                <Input placeholder="الوصف" value={editPlanData.description} onChange={e => setEditPlanData({ ...editPlanData, description: e.target.value })} />
                <Input placeholder="الوصف بالعربية" value={editPlanData.descriptionAr} onChange={e => setEditPlanData({ ...editPlanData, descriptionAr: e.target.value })} />
                <Input type="number" placeholder="السعر" value={editPlanData.price} onChange={e => setEditPlanData({ ...editPlanData, price: Number(e.target.value) })} />
                <Textarea placeholder="المميزات (سطر لكل ميزة)" value={editPlanData.features} onChange={e => setEditPlanData({ ...editPlanData, features: e.target.value })} />
                <Textarea placeholder="المميزات بالعربية (سطر لكل ميزة)" value={editPlanData.featuresAr} onChange={e => setEditPlanData({ ...editPlanData, featuresAr: e.target.value })} />
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleEditPlan}>حفظ</Button>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
