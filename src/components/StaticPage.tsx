
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import RichTextEditor from './RichTextEditor';

interface PageContent {
  id: number;
  page_key: string;
  content_en: string | null;
  content_ar: string | null;
  title_en: string | null;
  title_ar: string | null;
  last_updated: string;
}

const StaticPage: React.FC<{ pageKey: string }> = ({ pageKey }) => {
  const { t, language, dir } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const [content, setContent] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageId, setPageId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', pageKey)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPageId(data.id);
          const contentField = language === 'en' ? 'content_en' : 'content_ar';
          const htmlContent = data[contentField] || '';
          setContent(htmlContent);
          setOriginalContent(htmlContent);
        } else {
          setContent('');
          setOriginalContent('');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: t('error'),
          description: t('contentLoadError'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageContent();
  }, [pageKey, language, t, toast]);

  const handleSave = async () => {
    try {
      if (!pageId) {
        throw new Error(t('pageNotFound'));
      }

      const contentField = language === 'en' ? 'content_en' : 'content_ar';
      const { error } = await supabase
        .from('page_content')
        .update({ [contentField]: content })
        .eq('id', pageId);

      if (error) throw error;

      setOriginalContent(content);
      setEditMode(false);
      
      toast({
        title: t('saveSuccess'),
        description: t('contentSaved'),
      });
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('saveFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditMode(false);
  };

  return (
    <div dir={dir} className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{getPageTitle(pageKey, language, t)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-pulse">{t('loading')}</div>
            </div>
          ) : editMode && isAdmin() ? (
            <>
              <RichTextEditor
                value={content}
                onChange={handleContentChange}
                readOnly={false}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>{t('save')}</Button>
                <Button variant="secondary" onClick={handleCancel}>
                  {t('cancel')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <RichTextEditor
                value={content}
                onChange={() => {}}
                readOnly={true}
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

// Helper function to get page title
const getPageTitle = (pageKey: string, language: string, t: (key: string) => string) => {
  switch (pageKey) {
    case 'about':
      return language === 'ar' ? 'حول البرنامج' : t('about');
    case 'terms':
      return language === 'ar' ? 'شروط الاستخدام' : t('termsOfUse');
    case 'privacy':
      return language === 'ar' ? 'سياسة الخصوصية' : t('privacyPolicy');
    case 'copyright':
      return language === 'ar' ? 'حقوق النشر' : t('copyright');
    case 'contact':
      return language === 'ar' ? 'اتصل بنا' : t('contactUs');
    default:
      return t(pageKey);
  }
};

export default StaticPage;
