
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import RichTextEditor from './RichTextEditor';

interface StaticPageProps {
  pageKey: string;
}

const StaticPage: React.FC<StaticPageProps> = ({ pageKey }) => {
  const { t, language, dir } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
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
          .single();

        if (error) {
          console.error('Error fetching page content:', error);
          // Set default content if there's an error
          const defaultContent = language === 'en' 
            ? '<p>Content not available</p>' 
            : '<p>المحتوى غير متوفر</p>';
          setContent(defaultContent);
          setOriginalContent(defaultContent);
          return;
        }

        console.log('Page data received:', data);
        
        // Store the page ID for update operations
        setPageId(data.id);
        
        // Get the content based on language
        const contentField = language === 'en' ? 'content_en' : 'content_ar';
        let htmlContent = data[contentField];
        
        // Ensure we have valid HTML content
        if (!htmlContent || typeof htmlContent !== 'string') {
          htmlContent = language === 'en' 
            ? '<p>Content not available in English</p>' 
            : '<p>المحتوى غير متوفر باللغة العربية</p>';
        }

        console.log('Setting HTML content:', htmlContent);
        setContent(htmlContent);
        setOriginalContent(htmlContent);
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
    try {
      if (!content) {
        throw new Error(t('contentRequired'));
      }

      // Determine which field to update based on language
      const contentField = language === 'en' ? 'content_en' : 'content_ar';
      const updateData = { [contentField]: content };

      console.log('Saving content with ID:', pageId);
      console.log('Update data:', updateData);
      
      if (!pageId) {
        console.error('No page ID found for update');
        throw new Error(t('pageNotFound'));
      }

      const { error } = await supabase
        .from('page_content')
        .update(updateData)
        .eq('id', pageId);

      if (error) {
        console.error('Error updating content:', error);
        throw error;
      }

      // Verify the content was saved by fetching it again
      const { data: verifyData, error: verifyError } = await supabase
        .from('page_content')
        .select(contentField)
        .eq('id', pageId)
        .single();

      if (verifyError || !verifyData || verifyData[contentField] !== content) {
        console.error('Content verification failed:', verifyError);
        throw new Error(t('saveFailed'));
      }

      toast({
        title: t('saveSuccess'),
        description: t('contentSaved'),
        duration: 3000,
      });

      // Update original content to reflect new saved content
      setOriginalContent(content);
      setEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
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
                onChange={setContent}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave}>{t('save')}</Button>
                <Button variant="secondary" onClick={handleCancel}>{t('cancel')}</Button>
              </div>
            </>
          ) : (
            <>
              <div 
                className="rich-text-content prose prose-sm max-w-none" 
                dangerouslySetInnerHTML={{ __html: content }}
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
