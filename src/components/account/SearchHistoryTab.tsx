
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { SearchHistory } from '@/types/index';

interface SearchHistoryTabProps {
  user: any;
  searchHistory: SearchHistory[];
  fetchingHistory: boolean;
  handleRefreshSearchHistory: () => void;
}

export const SearchHistoryTab: React.FC<SearchHistoryTabProps> = ({
  user,
  searchHistory,
  fetchingHistory,
  handleRefreshSearchHistory
}) => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {language === 'ar' ? 'سجل البحث' : 'Search History'}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshSearchHistory} 
          disabled={fetchingHistory}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetchingHistory ? 'animate-spin' : ''}`} />
          {fetchingHistory 
            ? (language === 'ar' ? 'جاري التحديث...' : 'Refreshing...') 
            : (language === 'ar' ? 'تحديث' : 'Refresh')}
        </Button>
      </div>
      
      {!user?.plan_code || user.plan_code === 'visitor' ? (
        <div className="bg-amber-50 border border-amber-300 rounded p-4 text-center">
          <p className="font-medium text-amber-800">
            {language === 'ar' 
              ? 'هذه الميزة متاحة فقط للباقات المدفوعة' 
              : 'This feature is only available for paid plans'}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2" 
            onClick={() => navigate('/subscribe')}
          >
            {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
          </Button>
        </div>
      ) : fetchingHistory ? (
        <div className="text-center py-4">
          {language === 'ar' ? 'جاري تحميل سجل البحث...' : 'Loading search history...'}
        </div>
      ) : searchHistory.length > 0 ? (
        <div className="space-y-4">
          {searchHistory.map(record => (
            <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{record.search_query}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(record.created_at).toLocaleString()}
                </div>
              </div>
              
              {record.search_results && (
                <div className="mt-2 text-sm">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(record.search_results) ? (
                      record.search_results.map((result: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {typeof result === 'string' ? result : (result?.name || 'Result')}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-xs text-gray-600 italic">
                        {language === 'ar' ? 'نتائج متاحة' : 'Results available'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>{language === 'ar' ? 'لا يوجد سجل بحث' : 'No search history'}</p>
          <p className="text-sm mt-2">
            {language === 'ar' 
              ? 'ستظهر عمليات البحث الخاصة بك هنا' 
              : 'Your searches will appear here'}
          </p>
        </div>
      )}
    </div>
  );
};
