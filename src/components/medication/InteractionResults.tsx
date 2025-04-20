import React, { useRef, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Heart, ActivitySquare, AlertTriangle, Copy, Printer, CheckCircle, Share2, Loader } from 'lucide-react';
import { InteractionResult } from '@/types/medication';
import { useIsMobile } from '@/hooks/use-mobile';
import { captureAndShare } from '@/utils/shareResults';

interface InteractionResultsProps {
  result: InteractionResult | null;
  apiKeyError: boolean;
  scrollToResults: boolean;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({ result, apiKeyError, scrollToResults }) => {
  const { t, dir, language } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  if (!result) return null;
  
  const copyResults = () => {
    if (!resultRef.current) return;
    
    const resultText = resultRef.current.innerText;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      toast({
        title: language === 'ar' ? 'تم النسخ' : 'Copied',
        description: language === 'ar' ? 'تم نسخ النتائج بنجاح' : 'Results copied successfully',
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const printResults = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = resultRef.current?.innerHTML || '';
    
    printContent.style.fontFamily = 'Arial, sans-serif';
    printContent.style.padding = '20px';
    printContent.style.direction = dir;
    
    const windowPrint = window.open('', '', 'height=600,width=800');
    
    if (windowPrint) {
      windowPrint.document.write('<html><head><title>');
      windowPrint.document.write(language === 'ar' ? 'نتائج التفاعلات الدوائية' : 'Medication Interaction Results');
      windowPrint.document.write('</title>');
      windowPrint.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>');
      windowPrint.document.write('</head><body>');
      windowPrint.document.write(printContent.innerHTML);
      windowPrint.document.write('</body></html>');
      windowPrint.document.close();
      windowPrint.focus();
      
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 250);
    }
  };

  const handleShare = async () => {
    if (!resultRef.current) return;
    
    setIsSharing(true);
    try {
      await captureAndShare(resultRef, language === 'ar' ? 'نتائج التفاعلات الدوائية' : 'Medication Interaction Results');
      toast({
        title: language === 'ar' ? 'تمت المشاركة' : 'Shared Successfully',
        description: language === 'ar' ? 'تم تصدير وحفظ النتائج بنجاح' : 'Results have been exported successfully',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء المشاركة' : 'Error while sharing results',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card id="result-card" className="animate-fade-in shadow-lg transition-all duration-300 w-full border-0 scroll-mt-16" ref={resultRef}>
      <CardHeader className={result.hasInteractions ? "bg-red-50 rounded-t-lg" : "bg-green-50 rounded-t-lg"}>
        <CardTitle className="flex items-center">
          {result.hasInteractions ? (
            <>
              <ActivitySquare className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5 text-red-500`} />
              <span className="text-red-700">{t('interactionsFound')}</span>
            </>
          ) : (
            <>
              <Heart className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5 text-green-500`} />
              <span className="text-green-700">{t('noInteractionsFound')}</span>
            </>
          )}
        </CardTitle>
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            disabled={isSharing}
            className="bg-white/70 hover:bg-white/90 border-gray-200 text-gray-600"
          >
            {isSharing ? (
              <Loader className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'} animate-spin`} />
            ) : (
              <Share2 className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
            )}
            <span>{isSharing ? (language === 'ar' ? 'جاري المشاركة...' : 'Sharing...') : (language === 'ar' ? 'مشاركة' : 'Share')}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyResults}
            className="bg-white/70 hover:bg-white/90 border-gray-200 text-gray-600"
          >
            {copied ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <Copy className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
            )}
            <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={printResults}
            className="bg-white/70 hover:bg-white/90 border-gray-200 text-gray-600"
          >
            <Printer className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
            <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
          </Button>
        </div>
        {apiKeyError && (
          <div className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1 text-yellow-300" />
            {language === 'ar' 
              ? 'ملاحظة: النتائج أدناه تستند إلى بيانات تجريبية للتوضيح فقط.'
              : 'Note: Results below are based on demo data for illustration only.'}
          </div>
        )}
      </CardHeader>
      <CardContent className={`pt-6 ${isMobile ? 'px-3' : 'px-6'}`}>
        {!result.hasInteractions ? (
          <p className="text-green-700 font-medium">{t('noInteractions')}</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-red-700">{t('interactionsFound')}</h3>
              <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                {result.interactions?.map((interaction, i) => (
                  <li key={i} className="mb-2 text-sm">{interaction}</li>
                ))}
              </ul>
            </div>
            
            {result.ageWarnings && result.ageWarnings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-amber-700">{t('ageWarnings')}</h3>
                <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                  {result.ageWarnings.map((warning, i) => (
                    <li key={i} className="mb-2 text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.alternatives && result.alternatives.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-blue-700">{t('alternatives')}</h3>
                <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                  {result.alternatives.map((alternative, i) => (
                    <li key={i} className="mb-2 text-sm">{alternative}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Alert className="mt-6 bg-amber-50 border border-amber-300 text-amber-800 shadow-sm">
              <AlertTriangle className="h-4 w-4 inline-block mr-2 text-amber-500" />
              <AlertDescription className="text-xs">{t('disclaimer')}</AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractionResults;
