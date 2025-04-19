import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import Advertisement from './Advertisement';
import { supabase } from '@/integrations/supabase/client';

const SecondaryAdvertisement: React.FC = () => {
  const [htmlContent, setHtmlContent] = React.useState<string>('');

  React.useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'secondary_advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching secondary advertisement:', error);
          return;
        }
        
        if (data?.value && typeof data.value === 'object' && 'html' in data.value) {
          setHtmlContent((data.value as any).html as string);
        }
      } catch (error) {
        console.error('Error in secondary advertisement component:', error);
      }
    };
    
    fetchAdvertisement();
  }, []);

  if (!htmlContent) return null;
  
  return (
    <div 
      className="mb-6 w-full overflow-hidden" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

const Footer: React.FC = () => {
  const { dir } = useTranslation();
  
  return (
    <>
      <SecondaryAdvertisement />
      
      <footer className="bg-white border-t mt-auto py-8 sm:py-10 px-4 sm:px-8" dir={dir}>
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-gray-800 text-sm">
              جميع الحقوق محفوظة © لـ تطبيق دواء آمن
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
