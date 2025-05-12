
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const TransactionsManager = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as 'pending' | 'completed' | 'failed' | 'refunded');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // If we have the data, set it
      if (data) {
        setTransactions(data as Transaction[]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب المعاملات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'completed' | 'failed' | 'refunded') => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({ 
        title: 'تم التحديث', 
        description: 'تم تحديث حالة المعاملة بنجاح' 
      });
      
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة المعاملة',
        variant: 'destructive'
      });
    }
  };

  // Get user email from transaction metadata
  const getUserEmailFromTransaction = (transaction: Transaction): string => {
    if (!transaction.metadata) return 'غير معروف';
    
    const metadata = transaction.metadata as Record<string, any>;
    
    // Check for direct user_email property
    if (typeof metadata.user_email === 'string') {
      return metadata.user_email;
    }
    
    // Check for payer.email_address property
    if (metadata.payer && typeof metadata.payer === 'object' && 
        typeof metadata.payer.email_address === 'string') {
      return metadata.payer.email_address;
    }
    
    return 'غير معروف';
  };
  
  // Filter transactions by email
  const filteredTransactions = transactions.filter(transaction => {
    const email = getUserEmailFromTransaction(transaction);
    return email.toLowerCase().includes(searchEmail.toLowerCase());
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>إدارة المعاملات</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2 items-center">
          <Input placeholder="بحث بالبريد الإلكتروني" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="pending">قيد الإنتظار</SelectItem>
              <SelectItem value="failed">فشلت</SelectItem>
              <SelectItem value="refunded">مستردة</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchTransactions} disabled={loading}>
            {loading ? 'جاري التحديث...' : 'تحديث'}
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد معاملات تطابق معايير البحث</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الباقة</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map(transaction => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{getUserEmailFromTransaction(transaction)}</TableCell>
                    <TableCell>{transaction.plan_code}</TableCell>
                    <TableCell>
                      {transaction.amount} {transaction.currency}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.status === 'completed' ? 'مكتملة' :
                           transaction.status === 'failed' ? 'فشلت' :
                           transaction.status === 'pending' ? 'قيد الإنتظار' :
                           'مستردة'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        onValueChange={(value) => handleStatusChange(transaction.id, value as 'pending' | 'completed' | 'failed' | 'refunded')} 
                        defaultValue={transaction.status}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="تغيير الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">مكتملة</SelectItem>
                          <SelectItem value="pending">قيد الإنتظار</SelectItem>
                          <SelectItem value="failed">فشلت</SelectItem>
                          <SelectItem value="refunded">مستردة</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsManager;
