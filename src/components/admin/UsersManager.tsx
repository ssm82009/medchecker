
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

const UsersManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Tables<'users'>[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [plansList, setPlansList] = useState<any[]>([]);

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
    fetchUsers();
    fetchPlansList();
  }, [fetchUsers, fetchPlansList]);

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

  return (
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
  );
};

export default UsersManager;
