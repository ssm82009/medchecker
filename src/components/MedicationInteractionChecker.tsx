
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Advertisement from './Advertisement';

interface Medication {
  id: string;
  name: string;
}

interface InteractionResult {
  hasInteractions: boolean;
  interactions?: string[];
  alternatives?: string[];
}

const MedicationInteractionChecker: React.FC = () => {
  const { t, dir } = useTranslation();
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '' },
    { id: '2', name: '' }
  ]);
  const [healthCondition, setHealthCondition] = useState('');
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiSettings] = useLocalStorage<{ apiKey: string; model: string }>('aiSettings', { apiKey: '', model: 'gpt-4o-mini' });

  const addMedication = () => {
    setMedications([...medications, { id: Date.now().toString(), name: '' }]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 2) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, name: string) => {
    setMedications(medications.map(med => med.id === id ? { ...med, name } : med));
  };

  const checkInteractions = async () => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const medicationNames = validMedications.map(med => med.name);
      const prompt = `Check for potential interactions between these medications: ${medicationNames.join(', ')}${healthCondition ? `. The patient has the following health conditions: ${healthCondition}` : ''}. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives for each problematic medication"] }. If there are no interactions, return { "hasInteractions": false }.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSettings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: apiSettings.model,
          messages: [
            { role: 'system', content: 'You are a helpful healthcare assistant specializing in medication interactions.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error checking interactions');
      }
      
      let parsedResult: InteractionResult;
      try {
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No response from AI');
        
        // Extract JSON if it's wrapped in markdown
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        parsedResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to basic response
        parsedResult = {
          hasInteractions: false
        };
      }
      
      setResult(parsedResult);
    } catch (error) {
      console.error('Error checking interactions:', error);
      setResult({
        hasInteractions: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <Advertisement />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('appTitle')}</CardTitle>
          <CardDescription>{t('enterMedication')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.map((med, index) => (
            <div key={med.id} className="flex items-center gap-2">
              <div className="flex-1">
                <Input 
                  value={med.name} 
                  onChange={(e) => updateMedication(med.id, e.target.value)} 
                  placeholder={`${t('medication')} ${index + 1}`}
                />
              </div>
              {medications.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeMedication(med.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button variant="outline" onClick={addMedication} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {t('addMedication')}
          </Button>
          
          <div className="pt-4">
            <label className="block text-sm font-medium mb-1">{t('healthCondition')}</label>
            <Textarea 
              value={healthCondition}
              onChange={(e) => setHealthCondition(e.target.value)}
              placeholder={t('enterHealthCondition')}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={checkInteractions} 
            disabled={loading || medications.filter(m => m.name.trim() !== '').length < 2}
            className="w-full"
          >
            {loading ? t('loading') : t('checkInteractions')}
          </Button>
        </CardFooter>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{t('results')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!result.hasInteractions ? (
              <p>{t('noInteractions')}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{t('interactionsFound')}</h3>
                  <ul className="list-disc pl-5">
                    {result.interactions?.map((interaction, i) => (
                      <li key={i} className="mb-2">{interaction}</li>
                    ))}
                  </ul>
                </div>
                
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">{t('alternativeSuggestion')}</h3>
                    <ul className="list-disc pl-5">
                      {result.alternatives.map((alternative, i) => (
                        <li key={i} className="mb-2">{alternative}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationInteractionChecker;
