
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const PlansManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
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

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
    if (!error && data) setPlans(data);
    setLoadingPlans(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

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

  // فتح نافذة التعديل
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
        name_ar: 'الباقة الاحترافية',
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

  return (
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

        {/* Add Plan Modal */}
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

        {/* Edit Plan Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>تعديل الخطة</DialogTitle></DialogHeader>
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
      </CardContent>
    </Card>
  );
};

export default PlansManager;
