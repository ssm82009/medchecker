
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Advertisement: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        // Use type assertion to handle the type issue with Supabase client
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching advertisement:', error);
          return;
        }
        
        if (data && data.value && typeof data.value === 'object' && 'html' in data.value) {
          setHtmlContent(data.value.html as string);
        }
      } catch (error) {
        console.error('Error in advertisement component:', error);
      }
    };
    
    fetchAdvertisement();
  }, []);

  // Only render if there's content
  if (!htmlContent || htmlContent.trim() === '') return null;
  
  return (
    <div 
      className="mb-6 w-full overflow-hidden" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default Advertisement;
