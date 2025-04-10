
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, X, AlertCircle } from "lucide-react";
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [medications, setMedications] = useState<string[]>(['', '', '']);
  const [context, setContext] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const addMedication = () => {
    if (!isSubscribed && medications.length >= 3) {
      alert(t('freeLimit'));
      return;
    }
    setMedications([...medications, '']);
  };

  const removeMedication = (index: number) => {
    const updatedMeds = medications.filter((_, i) => i !== index);
    setMedications(updatedMeds);
  };

  const updateMedication = (index: number, value: string) => {
    const updatedMeds = [...medications];
    updatedMeds[index] = value;
    setMedications(updatedMeds);
  };

  const checkInteractions = () => {
    // This is where we would call the API to check interactions
    // For now, we'll just show mock results
    setShowResults(true);
  };

  const goToSubscription = () => {
    // This would redirect to the subscription page
    console.log("Navigate to subscription page");
    // For demo purposes:
    setIsSubscribed(true);
  };

  return (
    <div className={`container mx-auto py-8 px-4 ${t('language') === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('appTitle')}</h1>
        <LanguageSwitcher />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('medicationName')}</CardTitle>
        </CardHeader>
        <CardContent>
          {medications.map((med, index) => (
            <div key={index} className="flex items-center mb-3">
              <Input
                value={med}
                onChange={(e) => updateMedication(index, e.target.value)}
                placeholder={`${t('medicationName')} ${index + 1}`}
                className="flex-1 ml-2"
              />
              {index > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeMedication(index)}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button 
            variant="outline" 
            onClick={addMedication} 
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" /> {t('addMedication')}
          </Button>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              {t('medicalContext')}
            </label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t('medicalContext')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={checkInteractions} className="w-full">
            {t('checkInteractions')}
          </Button>
        </CardFooter>
      </Card>

      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>{t('interactionResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md bg-yellow-50 flex items-start">
              <AlertCircle className="text-yellow-500 mr-3 mt-1" />
              <div>
                <h3 className="font-medium">Mock Interaction Warning</h3>
                <p className="text-sm text-gray-600">
                  This is a mock interaction result. In a real application, we would display actual interaction data here from a medication database or AI analysis.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {!isSubscribed && (
              <div className="w-full">
                <p className="mb-2 text-center">{t('subscribeMessage')}</p>
                <Button onClick={goToSubscription} variant="outline" className="w-full">
                  {t('subscribeNow')}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Index;
