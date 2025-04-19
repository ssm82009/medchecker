
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
  content_en: string;
  content_ar: string;
  title_en: string;
  title_ar: string;
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
        console.log('Fetching page content for:', pageKey, 'language:', language);
        const { data, error } = await supabase
          .from('page_content')
          .select('*')
          .eq('page_key', pageKey)
          .maybeSingle();

        if (error) {
          console.error('Error fetching page content:', error);
          const defaultContent = language === 'en' 
            ? '<p>Content not available</p>' 
            : '<p>المحتوى غير متوفر</p>';
          setContent(defaultContent);
          setOriginalContent(defaultContent);
          return;
        }

        console.log('Page data received:', data);
        
        if (data) {
          setPageId(data.id);
          const contentField = language === 'en' ? 'content_en' : 'content_ar';
          let htmlContent = data[contentField] || '';
          
          if (!htmlContent.trim()) {
            htmlContent = language === 'en' 
              ? '<p>Content not available in English</p>' 
              : '<p>المحتوى غير متوفر باللغة العربية</p>';
          }

          console.log('Setting HTML content:', htmlContent);
          setContent(htmlContent);
          setOriginalContent(htmlContent);
        }
      } catch (err) {
        console.error('Error in fetch operation:', err);
        const errorContent = language === 'en' 
          ? '<p>Error loading content</p>' 
          : '<p>خطأ في تحميل المحتوى</p>';
        setContent(errorContent);
        setOriginalContent(errorContent);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageContent();
  }, [pageKey, language]);

  const handleSave = async () => {
    if (!content?.trim()) {
      toast({
        title: t('error'),
        description: t('contentRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const contentField = language === 'en' ? 'content_en' : 'content_ar';
      const updateData = { [contentField]: content };

      console.log('Saving content with ID:', pageId);
      console.log('Update data:', updateData);
      
      if (!pageId) {
        throw new Error(t('pageNotFound'));
      }

      const { error } = await supabase
        .from('page_content')
        .update(updateData)
        .eq('id', pageId);

      if (error) {
        throw error;
      }

      setOriginalContent(content);
      setEditMode(false);
      
      toast({
        title: t('saveSuccess'),
        description: t('contentSaved'),
      });
      
      // Trigger a page reload to ensure content is fresh
      window.location.reload();
      
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('saveFailed'),
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditMode(false);
  };

  const getPageTitle = () => {
    switch (pageKey) {
      case 'about':
        return language === 'ar' ? 'حول البرنامج' : t('about' as any);
      case 'terms':
        return language === 'ar' ? 'شروط الاستخدام' : t('termsOfUse' as any);
      case 'privacy':
        return language === 'ar' ? 'سياسة الخصوصية' : t('privacyPolicy' as any);
      case 'copyright':
        return language === 'ar' ? 'حقوق النشر' : t('copyright' as any);
      case 'contact':
        return language === 'ar' ? 'اتصل بنا' : t('contactUs' as any);
      default:
        return t(pageKey as any);
    }
  };

  return (
    <div dir={dir} className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{getPageTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-pulse">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
            </div>
          ) : editMode && isAdmin() ? (
            <>
              <RichTextEditor
                value={content}
                onChange={(html: string) => setContent(html)}
                readOnly={false}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>{t('save')}</Button>
                <Button variant="secondary" onClick={handleCancel}>{t('cancel')}</Button>
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

export default StaticPage;
