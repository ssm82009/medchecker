
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useTranslation } from '@/hooks/useTranslation';
import { Transaction } from '@/types';

interface TransactionsTabProps {
  user: any;
  transactions: Transaction[];
  fetchingTransactions: boolean;
  handleRefreshTransactions: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ 
  user, 
  transactions, 
  fetchingTransactions, 
  handleRefreshTransactions 
}) => {
  const { language } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshTransactions} 
          disabled={fetchingTransactions}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetchingTransactions ? 'animate-spin' : ''}`} />
          {fetchingTransactions 
            ? (language === 'ar' ? 'جاري التحديث...' : 'Refreshing...') 
            : (language === 'ar' ? 'تحديث' : 'Refresh')}
        </Button>
      </div>
      
      {fetchingTransactions ? (
        <div className="text-center py-4">
          {language === 'ar' ? 'جاري تحميل المعاملات...' : 'Loading transactions...'}
        </div>
      ) : transactions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead>{language === 'ar' ? 'الباقة' : 'Plan'}</TableHead>
              <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
              <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{transaction.plan_code}</TableCell>
                <TableCell>
                  {transaction.amount} {transaction.currency}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {language === 'ar' ? 
                      transaction.status === 'completed' ? 'مكتمل' :
                      transaction.status === 'failed' ? 'فشل' :
                      transaction.status === 'pending' ? 'قيد الانتظار' :
                      'مسترد' :
                      transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                    }
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center text-gray-500 py-4">
          {language === 'ar' ? 'لا توجد معاملات سابقة' : 'No previous transactions'}
          <div className="mt-2 text-sm">
            {language === 'ar' 
              ? 'معرف المستخدم: ' + user.id + (user.auth_uid ? ' | معرف المصادقة: ' + user.auth_uid : '')
              : 'User ID: ' + user.id + (user.auth_uid ? ' | Auth ID: ' + user.auth_uid : '')}
          </div>
        </div>
      )}
    </div>
  );
};
