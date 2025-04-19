
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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

  useEffect(() => {
    const fetchPageContent = async () => {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_key', pageKey)
        .single();

      if (error) {
        console.error('Error fetching page content:', error);
        return;
      }

      const localizedContent = language === 'en' ? data.content_en : data.content_ar;
      setContent(localizedContent);
      setOriginalContent(localizedContent);
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

  return (
    <div dir={dir} className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t(pageKey.toLowerCase())}</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode && isAdmin() ? (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mb-4 min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave}>{t('save')}</Button>
                <Button variant="secondary" onClick={handleCancel}>{t('cancel')}</Button>
              </div>
            </>
          ) : (
            <>
              <p>{content}</p>
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
