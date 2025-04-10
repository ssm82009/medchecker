
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface AdSettings {
  htmlCode: string;
}

const Advertisement = () => {
  const [adHtml, setAdHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAdSettings = async () => {
      setLoading(true);
      try {
        // Using any type to bypass TypeScript errors until database types are updated
        const { data, error } = await supabase
          .from('settings' as any)
          .select('value')
          .eq('type', 'ads')
          .single();

        if (error) {
          console.error("Error loading ad settings:", error);
          return;
        }

        if (data && data.value) {
          const adSettings = data.value as AdSettings;
          if (adSettings.htmlCode) {
            setAdHtml(adSettings.htmlCode);
          }
        }
      } catch (error) {
        console.error("Error in loadAdSettings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdSettings();
  }, []);

  if (loading || !adHtml) {
    return null;
  }

  return (
    <Card className="my-4 overflow-hidden">
      <div dangerouslySetInnerHTML={{ __html: adHtml }} />
    </Card>
  );
};

export default Advertisement;
