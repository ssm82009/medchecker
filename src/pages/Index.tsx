
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plus, X, AlertCircle, User, Settings } from "lucide-react";
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
    <div className={`min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 ${t('language') === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{t('appTitle')}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/profile">
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="icon" className="rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="mb-6 border-0 shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-t-lg">
            <CardTitle className="text-center text-xl">{t('medicationName')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {medications.map((med, index) => (
              <div key={index} className="flex items-center mb-3">
                <Input
                  value={med}
                  onChange={(e) => updateMedication(index, e.target.value)}
                  placeholder={`${t('medicationName')} ${index + 1}`}
                  className="flex-1 border-purple-200 dark:border-purple-800 focus-visible:ring-purple-500"
                />
                {index > 0 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMedication(index)}
                    className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button 
              variant="outline" 
              onClick={addMedication} 
              className="mt-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              <Plus className="h-4 w-4 mr-2" /> {t('addMedication')}
            </Button>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('medicalContext')}
              </label>
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t('medicalContext')}
                className="border-purple-200 dark:border-purple-800 focus-visible:ring-purple-500"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-purple-100 dark:border-purple-900/30 pt-4">
            <Button 
              onClick={checkInteractions} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {t('checkInteractions')}
            </Button>
          </CardFooter>
        </Card>

        {showResults && (
          <Card className="border-0 shadow-md overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20">
              <CardTitle className="text-center text-xl">{t('interactionResults')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20 flex items-start">
                <AlertCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Mock Interaction Warning</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    This is a mock interaction result. In a real application, we would display actual interaction data here from a medication database or AI analysis.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-amber-100 dark:border-amber-900/30 pt-4">
              {!isSubscribed && (
                <div className="w-full">
                  <p className="mb-2 text-center text-gray-600 dark:text-gray-400">{t('subscribeMessage')}</p>
                  <Button 
                    onClick={goToSubscription} 
                    variant="outline" 
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    {t('subscribeNow')}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
