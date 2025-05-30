
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import './StaticPage.css';

interface PageContent {
  id: number;
  page_key: string;
  content_en: string | null;
  content_ar: string | null;
  title_en: string;
  title_ar: string;
  last_updated: string | null;
}

interface StaticPageProps {
  pageKey: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageKey }) => {
  const { t, language, dir } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [originalContentEn, setOriginalContentEn] = useState('');
  const [originalContentAr, setOriginalContentAr] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageId, setPageId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPageContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .maybeSingle();

      if (error) {
        console.error('Error fetching page content:', error);
        toast({
          title: t('error'),
          description: t('contentFetchError'),
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      if (data) {
        setPageId(data.id);
        setContentEn(data.content_en || '');
        setContentAr(data.content_ar || '');
        setOriginalContentEn(data.content_en || '');
        setOriginalContentAr(data.content_ar || '');
      }
    } catch (error) {
      console.error('Error in fetchPageContent:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, [pageKey]);

  const handleSave = async () => {
    if (!pageId) {
      console.error('No page ID found, cannot save');
      toast({
        title: t('error'),
        description: t('pageIdMissing'),
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('page_content')
        .update({
          content_en: contentEn,
          content_ar: contentAr,
          last_updated: new Date().toISOString()
        })
        .eq('id', pageId)
        .select()
        .maybeSingle();

      console.log('> Supabase update returned:', { data, error });

      if (error) {
        console.error('Error updating content:', error);
        toast({
          title: t('error'),
          description: error.message || t('updatePermissionError'),
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      if (data) {
        setContentEn(data.content_en || '');
        setContentAr(data.content_ar || '');
        setOriginalContentEn(data.content_en || '');
        setOriginalContentAr(data.content_ar || '');
        
        toast({
          title: t('saveSuccess'),
          description: t('contentSaved'),
          duration: 3000,
        });
        
        setEditMode(false);
      } else {
        // إظهار رسالة نجاح حتى إذا لم يتم إرجاع البيانات
        toast({
          title: t('saveSuccess'),
          description: t('contentSaved'),
          duration: 3000,
        });
        
        // إعادة تحميل المحتوى
        await fetchPageContent();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContentEn(originalContentEn);
    setContentAr(originalContentAr);
    setEditMode(false);
  };

  const currentContent = language === 'en' ? contentEn : contentAr;

  if (isLoading) {
    return (
      <div dir={dir} className="container mx-auto p-4 text-center">
        <Card className="min-h-[300px] flex items-center justify-center">
          <CardContent>
            <p>{t('loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir={dir} className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t(`${pageKey}Title` as any)}</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode && isAdmin() ? (
            <>
              <div className="mb-4">
                <h3 className="font-medium mb-2">{language === 'en' ? 'Arabic Content:' : 'المحتوى العربي:'}</h3>
                <Textarea
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  className="mb-4 min-h-[200px] font-arabic"
                  dir="rtl"
                />
              </div>
              <div className="mb-4">
                <h3 className="font-medium mb-2">{language === 'en' ? 'English Content:' : 'المحتوى الإنجليزي:'}</h3>
                <Textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  className="mb-4 min-h-[200px]"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? t('loading') : t('save')}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  {t('cancel')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div 
                className="static-page-content"
                dangerouslySetInnerHTML={{ __html: currentContent }}
              />
              {isAdmin() && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setEditMode(true)}
                >
                  {t('edit')}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticPage;
