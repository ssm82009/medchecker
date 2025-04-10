
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

// AI Settings interface
interface AISettings {
  model: string;
  apiKey: string;
  maxOutputs: number;
  maxMedicationInputRows: number;
}

// Ads interface
interface AdSettings {
  htmlCode: string;
}

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings>({
    model: "gpt-4o",
    apiKey: "",
    maxOutputs: 10,
    maxMedicationInputRows: 5
  });
  const [adSettings, setAdSettings] = useState<AdSettings>({
    htmlCode: ""
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user email matches admin email
      if (session.user.email === "56eeer@gmail.cm") {
        setIsAdmin(true);
        // Load settings
        await loadSettings();
      } else {
        navigate("/");
        toast({
          title: t("unauthorizedAccess"),
          description: t("adminAccessRequired"),
          variant: "destructive"
        });
      }
      setLoading(false);
    };

    checkAdmin();
  }, [navigate, t]);

  // Load settings from database
  const loadSettings = async () => {
    try {
      // Load AI settings
      const { data: aiData, error: aiError } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'ai')
        .single();

      if (aiError && aiError.code !== 'PGSQL_ERROR_RELATION_DOES_NOT_EXIST') {
        console.error("Error loading AI settings:", aiError);
      } else if (aiData) {
        setAISettings(aiData.value);
      }

      // Load ad settings
      const { data: adData, error: adError } = await supabase
        .from('settings')
        .select('*')
        .eq('type', 'ads')
        .single();

      if (adError && adError.code !== 'PGSQL_ERROR_RELATION_DOES_NOT_EXIST') {
        console.error("Error loading Ad settings:", adError);
      } else if (adData) {
        setAdSettings(adData.value);
      }
    } catch (error) {
      console.error("Error in loadSettings:", error);
    }
  };

  // Save AI settings
  const saveAISettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          type: 'ai', 
          value: aiSettings 
        }, { 
          onConflict: 'type' 
        });

      if (error) throw error;
      
      toast({
        title: t("settingsSaved"),
        description: t("aiSettingsSavedSuccessfully"),
      });
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast({
        title: t("error"),
        description: t("failedToSaveSettings"),
        variant: "destructive"
      });
    }
  };

  // Save Ad settings
  const saveAdSettings = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          type: 'ads', 
          value: adSettings 
        }, { 
          onConflict: 'type' 
        });

      if (error) throw error;
      
      toast({
        title: t("settingsSaved"),
        description: t("adSettingsSavedSuccessfully"),
      });
    } catch (error) {
      console.error("Error saving Ad settings:", error);
      toast({
        title: t("error"),
        description: t("failedToSaveSettings"),
        variant: "destructive"
      });
    }
  };

  // Preview the HTML ad
  const AdPreview = () => {
    return (
      <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
        <div className="text-sm font-medium mb-2">{t("adPreview")}:</div>
        <div className="border p-4 bg-white dark:bg-gray-700 rounded" 
             dangerouslySetInnerHTML={{ __html: adSettings.htmlCode }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t("loading")}...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Navigate has already been called
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{t("adminDashboard")}</h1>
      
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ai">{t("aiSettings")}</TabsTrigger>
          <TabsTrigger value="ads">{t("advertisements")}</TabsTrigger>
        </TabsList>
        
        {/* AI Settings Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>{t("aiSettings")}</CardTitle>
              <CardDescription>
                {t("configureAiModelAndLimits")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="model">{t("aiModel")}</Label>
                  <Input
                    id="model"
                    value={aiSettings.model}
                    onChange={(e) => setAISettings({...aiSettings, model: e.target.value})}
                    placeholder="gpt-4o"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="apiKey">{t("apiKey")}</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={aiSettings.apiKey}
                    onChange={(e) => setAISettings({...aiSettings, apiKey: e.target.value})}
                    placeholder="sk-..."
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="maxOutputs">{t("maxAllowedOutputs")}</Label>
                  <Input
                    id="maxOutputs"
                    type="number"
                    value={aiSettings.maxOutputs}
                    onChange={(e) => setAISettings({...aiSettings, maxOutputs: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="maxRows">{t("maxMedicationInputRows")}</Label>
                  <Input
                    id="maxRows"
                    type="number"
                    value={aiSettings.maxMedicationInputRows}
                    onChange={(e) => setAISettings({...aiSettings, maxMedicationInputRows: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveAISettings} className="ml-auto">
                {t("saveSettings")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Advertisements Tab */}
        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>{t("advertisementSettings")}</CardTitle>
              <CardDescription>
                {t("insertHtmlCodeForAds")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="htmlCode">{t("htmlAdvertisementCode")}</Label>
                <Textarea
                  id="htmlCode"
                  value={adSettings.htmlCode}
                  onChange={(e) => setAdSettings({...adSettings, htmlCode: e.target.value})}
                  placeholder="<div>Your ad HTML here</div>"
                  className="min-h-[200px] font-mono"
                />
              </div>
              
              {adSettings.htmlCode && (
                <>
                  <Separator />
                  <AdPreview />
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveAdSettings} className="ml-auto">
                {t("saveSettings")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
