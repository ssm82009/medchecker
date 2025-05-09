import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage, AISettingsType, safelyParseAISettings } from '@/hooks/useLocalStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Json, Tables } from '@/integrations/supabase/types';
import { PlanType } from '../types/plan';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings, UserCog, Layers, Users, Image as ImageIcon, BadgeDollarSign, CreditCard } from 'lucide-react';

const adminSections = [
  { key: 'ai', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { key: 'logo', label: 'إعدادات الشعار', icon: ImageIcon },
  { key: 'ad', label: 'الإعلانات', icon: BadgeDollarSign },
  { key: 'plans', label: 'الخطط', icon: Layers },
  { key: 'users', label: 'إدارة الأعضاء', icon: Users },
  { key: 'paypal', label: 'بوابة الدفع بايبال', icon: CreditCard },
];

const Admin: React.FC = () => {
  const { t, dir } = useTranslation();
  const { toast } = useToast();
  const [aiSettings, setAiSettings] = useLocalStorage<AISettingsType>('aiSettings', { 
    apiKey: '', 
    model: 'gpt-4o-mini' 
  });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [adHTML, setAdHTML] = useState('');
  const [secondaryAdHTML, setSecondaryAdHTML] = useState('');
  const [logoText, setLogoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const [logoTextInput, setLogoTextInput] = useState('');
  
  const [plans, setPlans] = useState<any[]>([]);
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
  const [editPlanData, setEditPlanData] = useState<any | null>(null);
  const [addPlanData, setAddPlanData] = useState({
    code: '',
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: 0,
    features: '',
    features_ar: '',
    is_default: false,
  });
  
  const [users, setUsers] = useState<Tables<'users'>[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [plansList, setPlansList] = useState<any[]>([]);
  
  const [activeSection, setActiveSection] = useState('ai');
  
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox');
  const [sandboxClientId, setSandboxClientId] = useState('');
  const [sandboxSecret, setSandboxSecret] = useState('');
  const [liveClientId, setLiveClientId] = useState('');
  const [liveSecret, setLiveSecret] = useState('');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSettingsId, setPaypalSettingsId] = useState<string | null>(null);
  
  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
    if (!error && data) setPlans(data);
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
    if (!error && data) setPlansList(data);
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchUsers();
    fetchPlansList();
  }, [fetchPlans, fetchUsers, fetchPlansList]);
  
  useEffect(() => {
    // الحصول على إعدادات الذكاء الاصطناعي عند تحميل الصفحة
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching AI settings:', error);
          return;
        }
        
        if (data?.value) {
          // التحقق من أن البيانات مناسبة لنوع AISettingsType
          const value = data.value;
          
          if (typeof value === 'object' && !Array.isArray(value)) {
            // استخدام وظيفة التحويل الآمن
            const parsedSettings = safelyParseAISettings(value as Record<string, Json>);
            
            setApiKey(parsedSettings.apiKey || '');
            setModel(parsedSettings.model || 'gpt-4o-mini');
          }
        } else {
          // استخدام القيم من localStorage إذا لم تكن متوفرة في قاعدة البيانات
          setApiKey(aiSettings.apiKey || '');
          setModel(aiSettings.model || 'gpt-4o-mini');
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };
    
    // الحصول على إعدادات الإعلانات
    const fetchAdSettings = async () => {
      try {
        const { data: adData, error: adError } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'advertisement')
          .maybeSingle();
          
        if (adError && adError.code !== 'PGRST116') {
          console.error('Error fetching advertisement:', adError);
        } else if (adData?.value) {
          setAdHTML(typeof adData.value === 'string' ? adData.value : '');
        }
        
        const { data: secondaryAdData, error: secondaryAdError } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'secondary_advertisement')
          .maybeSingle();
          
        if (secondaryAdError && secondaryAdError.code !== 'PGRST116') {
          console.error('Error fetching secondary advertisement:', secondaryAdError);
        } else if (secondaryAdData?.value) {
          setSecondaryAdHTML(typeof secondaryAdData.value === 'string' ? secondaryAdData.value : '');
        }
      } catch (error) {
        console.error('Error in fetchAdSettings:', error);
      }
    };
    
    // تعيين قيمة logoTextInput
    setLogoTextInput(logoText);
    
    fetchSettings();
    fetchAdSettings();
  }, []);
  
  const saveAISettings = async () => {
    // تعيين القيم الحالية
    const newSettings: AISettingsType = {
      apiKey,
      model
    };
    
    try {
      // تحديث في localStorage
      setAiSettings(newSettings);
      
      // تح��يث في قاعدة البيانات
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'ai_settings',
          value: newSettings as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('settingsSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'advertisement',
          value: adHTML as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('adSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveSecondaryAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'secondary_advertisement',
          value: secondaryAdHTML as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('secondaryAdSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving secondary advertisement:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveLogo = () => {
    setLogoText(logoTextInput);
    toast({
      title: t('saveSuccess'),
      description: t('logoSaved'),
      duration: 3000,
    });
  };
  
  // إضافة خطة جديدة
  const handleAddPlan = async () => {
    if (!addPlanData.code || !addPlanData.name || !addPlanData.name_ar) {
      toast({ title: 'خطأ', description: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('plans').insert({
      code: addPlanData.code,
      name: addPlanData.name,
      name_ar: addPlanData.name_ar,
      description: addPlanData.description,
      description_ar: addPlanData.description_ar,
      price: addPlanData.price,
      features: addPlanData.features.split('\n').filter(Boolean),
      features_ar: addPlanData.features_ar.split('\n').filter(Boolean),
      is_default: addPlanData.is_default,
    });
    if (!error) {
      toast({ title: 'تمت الإضافة', description: 'تمت إضافة الخطة بنجاح' });
      setShowAddModal(false);
      setAddPlanData({ code: '', name: '', name_ar: '', description: '', description_ar: '', price: 0, features: '', features_ar: '', is_default: false });
      fetchPlans();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
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

  // فتح نا��ذة التعديل
  const openEditModal = (plan: any) => {
    setEditPlanData({ ...plan, features: (plan.features || []).join('\n'), features_ar: (plan.features_ar || []).join('\n') });
    setShowEditModal(true);
  };

  // حفظ التعديل
  const handleEditPlan = async () => {
    if (!editPlanData.code || !editPlanData.name || !editPlanData.name_ar) {
      toast({ title: 'خطأ', description: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    const { id, ...rest } = editPlanData;
    const { error } = await supabase.from('plans').update({
      code: rest.code,
      name: rest.name,
      name_ar: rest.name_ar,
      description: rest.description,
      description_ar: rest.description_ar,
      price: rest.price,
      features: rest.features.split('\n').filter(Boolean),
      features_ar: rest.features_ar.split('\n').filter(Boolean),
      is_default: rest.is_default,
    }).eq('id', id);
    if (!error) {
      toast({ title: 'تم التحديث', description: 'تم تحديث الخطة' });
      setShowEditModal(false);
      setEditPlanData(null);
      fetchPlans();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleChangePlan = async (userId: number, newPlan: string) => {
    const { error } = await supabase.from('users').update({ plan_code: newPlan }).eq('id', userId);
    if (!error) {
      toast({ title: 'تم التحديث', description: 'تم تغيير الباقة للمستخدم' });
      fetchUsers();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) {
      toast({ title: 'تم الحذف', description: 'تم حذف المستخدم' });
      fetchUsers();
    } else {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };
  
  const updatePlansToNewStructure = async () => {
    try {
      // تحديث جميع الخطط لتكون غير افتراضية
      await supabase.from('plans').update({ is_default: false }).neq('code', 'basic');
      
      // تحديث خطة الزائر
      await supabase.from('plans').upsert({
        code: 'visitor',
        name: 'Visitor Plan',
        name_ar: 'باقة الزائر',
        description: 'Basic features for unregistered users',
        description_ar: 'ميزات أساسية للمستخدمين غير المسجلين',
        price: 0,
        features: [
          'Check up to 2 medications',
          'Basic interaction analysis'
        ],
        features_ar: [
          'فحص حتى دوائين',
          'تحليل أساسي للتفاعلات'
        ],
        is_default: false
      }, { onConflict: 'code' });

      // تحديث الخطة الأساسية لتكون مجانية وافتراضية
      await supabase.from('plans').upsert({ 
        code: 'basic',
        is_default: true,
        price: 0,
        name: 'Basic Plan',
        name_ar: 'الباقة الأساسية',
        description: 'Free basic plan for registered users',
        description_ar: 'الباقة الأساسية المجانية للمستخدمين المسجلين',
        features: [
          'Check up to 5 medications',
          'Basic interaction analysis'
        ],
        features_ar: [
          'فحص حتى 5 أدوية',
          'تحليل أساسي للتفاعلات'
        ]
      }, { onConflict: 'code' });

      // تحديث الخطة الاحترافية
      await supabase.from('plans').upsert({
        code: 'pro',
        name: 'Professional Plan',
        name_ar: 'ال���اقة الاحترافية',
        description: 'Advanced features for healthcare professionals',
        description_ar: 'مميزات متقدمة للمهنيين الصحيين',
        price: 9.99,
        features: [
          'Check up to 10 medications',
          'Advanced interaction analysis',
          'Image-based medication search',
          'Patient medication history'
        ],
        features_ar: [
          'فحص حتى 10 أدوية',
          'تحليل متقدم للتفاعلات',
          'البحث عن الأدوية بالصور',
          'سجل أدوية المريض'
        ],
        is_default: false
      }, { onConflict: 'code' });

      toast({ 
        title: 'تم التحديث', 
        description: 'تم تحديث الخطط بنجاح', 
        duration: 3000 
      });
      
      // تحديث عرض الخطط
      fetchPlans();
    } catch (error) {
      console.error('Error updating plans:', error);
      toast({ 
        title: 'خطأ', 
        description: 'حدث خطأ أثناء تحديث الخطط', 
        variant: 'destructive',
        duration: 5000 
      });
    }
  };
  
  // جلب الإعدادات من قاعدة البيانات
  const fetchPaypalSettings = async () => {
    try {
      const { data, error } = await supabase.from('paypal_settings').select('*').single();
      if (error) {
        console.error('Error fetching PayPal settings:', error);
        return;
      }
      
      if (data) {
        setPaypalSettingsId(data.id);
        setPaypalMode(data.mode || 'sandbox');
        setSandboxClientId(data.sandbox_client_id || '');
        setSandboxSecret(data.sandbox_secret || '');
        setLiveClientId(data.live_client_id || '');
        setLiveSecret(data.live_secret || '');
      }
    } catch (error) {
      console.error('Error in fetchPaypalSettings:', error);
    }
  };
  
  useEffect(() => { 
    fetchPaypalSettings(); 
  }, []);

  // حفظ الإعدادات
  const savePaypalSettings = async () => {
    setSavingPaypal(true);
    try {
      const toSave = {
        id: paypalSettingsId,
        mode: paypalMode,
        sandbox_client_id: sandboxClientId,
        sandbox_secret: sandboxSecret,
        live_client_id: liveClientId,
        live_secret: liveSecret,
        currency: 'USD',
        payment_type: 'one_time' as const,
        updated_at: new Date().toISOString()
      };

      let error;
      if (paypalSettingsId) {
        // تحديث الإعدادات الموجودة
        const result = await supabase.from('paypal_settings').update(toSave).eq('id', paypalSettingsId);
        error = result.error;
      } else {
        // إدراج إعدادات جديدة
        const result = await supabase.from('paypal_settings').insert(toSave);
        error = result.error;
        
        // إعادة استرداد المعرف الجديد
        if (!error) {
          fetchPaypalSettings();
        }
      }

      if (error) {
        console.error('Error saving PayPal settings:', error);
        toast({ 
          title: 'خطأ في حفظ الإعدادات',
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'تم حفظ الإعدادات بنجاح',
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Exception in savePaypalSettings:', error);
      toast({ 
        title: 'خطأ في حفظ الإعدادات',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingPaypal(false);
    }
  };
  
  // Fix the type assignment issue with a more robust type check
  const handlePaypalModeChange = (value: string) => {
    // Type guard: only set state when value matches one of our allowed types
    if (value === 'sandbox' || value === 'live') {
      // Now TypeScript knows value can only be 'sandbox' or 'live'
      setPaypalMode(value);
    }
  };
  
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
                        <td>{plan.name_ar}</td>
                        <td>{plan.price}</td>
                        <td><ul>{plan.features?.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></td>
                        <td><ul>{plan.features_ar?.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul></td>
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
            <CardHeader><CardTitle>إ��ارة الأعضاء</CardTitle></CardHeader>
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
                              <option key={plan.code} value={plan.code}>{plan.name_ar || plan.name}</option>
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
              <Input placeholder="الاسم بالعربية" value={addPlanData.name_ar} onChange={e => setAddPlanData({ ...addPlanData, name_ar: e.target.value })} />
              <Input placeholder="الوصف" value={addPlanData.description} onChange={e => setAddPlanData({ ...addPlanData, description: e.target.value })} />
              <Input placeholder="الوصف بالعربية" value={addPlanData.description_ar} onChange={e => setAddPlanData({ ...addPlanData, description_ar: e.target.value })} />
              <Input type="number" placeholder="السعر" value={addPlanData.price} onChange={e => setAddPlanData({ ...addPlanData, price: Number(e.target.value) })} />
              <Textarea placeholder="المميزات (سطر لكل ميزة)" value={addPlanData.features} onChange={e => setAddPlanData({ ...addPlanData, features: e.target.value })} />
              <Textarea placeholder="المميزات بالعربية (سطر لكل ميزة)" value={addPlanData.features_ar} onChange={e => setAddPlanData({ ...addPlanData, features_ar: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={handleAddPlan}>إضافة</Button>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>تع��يل الخطة</DialogTitle></DialogHeader>
            {editPlanData && (
              <div className="space-y-2">
                <Input placeholder="رمز الخطة" value={editPlanData.code} onChange={e => setEditPlanData({ ...editPlanData, code: e.target.value })} />
                <Input placeholder="اسم الخطة" value={editPlanData.name} onChange={e => setEditPlanData({ ...editPlanData, name: e.target.value })} />
                <Input placeholder="الاسم بالعربية" value={editPlanData.name_ar} onChange={e => setEditPlanData({ ...editPlanData, name_ar: e.target.value })} />
                <Input placeholder="الوصف" value={editPlanData.description} onChange={e => setEditPlanData({ ...editPlanData, description: e.target.value })} />
                <Input placeholder="الوصف بالعربية" value={editPlanData.description_ar} onChange={e => setEditPlanData({ ...editPlanData, description_ar: e.target.value })} />
                <Input type="number" placeholder="السعر" value={editPlanData.price} onChange={e => setEditPlanData({ ...editPlanData, price: Number(e.target.value) })} />
                <Textarea placeholder="المميزات (سطر لكل ميزة)" value={editPlanData.features} onChange={e => setEditPlanData({ ...editPlanData, features: e.target.value })} />
                <Textarea placeholder="المميزات بالعربية (سطر لكل ميزة)" value={editPlanData.features_ar} onChange={e => setEditPlanData({ ...editPlanData, features_ar: e.target.value })} />
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
