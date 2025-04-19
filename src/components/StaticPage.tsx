
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

  useEffect(() => {
    const fetchPageContent = async () => {
      setIsLoading(true);
      
      try {
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

        // Ensure we have content to display
        const localizedContent = language === 'en' 
          ? (data.content_en || '<p>Content not available in English</p>') 
          : (data.content_ar || '<p>المحتوى غير متوفر باللغة العربية</p>');
        
        setContent(localizedContent);
        setOriginalContent(localizedContent);
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
      const updateData = language === 'en' 
        ? { content_en: content } 
        : { content_ar: content };

      const { error } = await supabase
        .from('page_content')
        .update(updateData)
        .eq('page_key', pageKey);

      if (error) throw error;

      toast({
        title: t('saveSuccess'),
        description: t('contentSaved'),
        duration: 3000,
      });

      setEditMode(false);
      setOriginalContent(content);
    } catch (error) {
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
              <RichTextEditor
                value={content}
                readOnly={true}
                onChange={(value) => {
                  /* Read-only mode, but we need to provide this function */
                  console.log('Read-only content:', value);
                }}
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
