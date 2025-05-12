
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageToTextScannerProps {
  onTextDetected: (text: string) => void;
  canUse?: boolean;
}

const ImageToTextScanner: React.FC<ImageToTextScannerProps> = ({ onTextDetected, canUse = true }) => {
  const { t, language, dir } = useTranslation();
  const { toast } = useToast();
  const [progress, setProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL with quality parameter
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const updateStatusMessage = () => {
    const messages = language === 'ar' 
      ? [
          "⏳ جاري معالجة الصورة بالذكاء الاصطناعي...",
          "🔍 نحاول التعرف على الأدوية في الصورة...",
          "🧠 نعالج البيانات باستخدام الذكاء الاصطناعي...",
          "📑 يتم تحديد الأدوية..."
        ]
      : [
          "⏳ Processing image with AI...",
          "🔍 Trying to identify medications in the image...",
          "🧠 Processing data with AI...",
          "📑 Extracting medications..."
        ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setStatusMessage(randomMessage);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProgress(0);
    setIsScanning(true);
    
    try {
      // Compress and convert the image to a data URL
      const dataUrl = await compressImage(file);
      detectMedications(dataUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsScanning(false);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل معالجة الصورة' : 'Failed to process image',
        variant: "destructive"
      });
    }
  };

  const openCamera = () => {
    if (!canUse) return;
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const selectImage = () => {
    if (!canUse) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetImage = () => {
    setProgress(0);
    setIsScanning(false);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      updateStatusMessage();
      interval = setInterval(updateStatusMessage, 2500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, language]);

  const scrollToMedicationInputs = () => {
    const parentElement = document.querySelector('.group.transition.duration-200.animate-in.fade-in');
    
    if (parentElement) {
      setTimeout(() => {
        parentElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  };

  const detectMedications = async (imageDataUrl: string) => {
    setProgress(20);
    setIsScanning(true);

    try {
      // Simulating progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 80) return prev + 5;
          return prev;
        });
      }, 500);

      // Call the Supabase edge function to detect medications in the image
      const { data, error } = await supabase.functions.invoke('detect-medications', {
        body: { image: imageDataUrl }
      });

      clearInterval(progressInterval);
      setProgress(90);

      if (error) {
        console.error('Error calling detect-medications function:', error);
        throw new Error(error.message);
      }

      console.log('AI detection response:', data);
      
      const medications = data?.medications || [];
      
      if (medications.length > 0) {
        onTextDetected(medications.join(','));
        
        toast({
          title: language === 'ar' ? 'تم التعرف على الأدوية' : 'Medications detected',
          description: language === 'ar' 
            ? `تم العثور على ${medications.length} أدوية محتملة` 
            : `Found ${medications.length} potential medications`,
        });
        
        scrollToMedicationInputs();
      } else {
        toast({
          title: language === 'ar' ? 'تحذير' : 'Warning',
          description: language === 'ar' 
            ? 'لم يتم العثور على أي أدوية، حاول التقاط صورة أوضح تظهر أسماء الأدوية' 
            : 'No medications found, try taking a clearer picture showing medication names',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error detecting medications:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء معالجة الصورة' 
          : 'Error processing the image',
        variant: "destructive"
      });
    } finally {
      setProgress(100);
      setIsScanning(false);
    }
  };

  return (
    <div className={`mt-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div className="text-xs font-light text-orange-500 mb-3 flex items-center justify-center opacity-70">
        <ArrowDown className="h-3 w-3 mr-1" />
        {language === 'ar' 
          ? 'التقط صورة لعلبة الدواء للتعرف على الاسم بالذكاء الاصطناعي' 
          : 'Take a picture of medication box for AI-powered name detection'}
      </div>
      
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs flex-1 bg-gray-50 hover:bg-gray-100 border-dashed"
          onClick={openCamera}
          disabled={isScanning}
        >
          <Camera className={`h-3 w-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
          {t("captureImage")}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs flex-1 bg-gray-50 hover:bg-gray-100 border-dashed"
          onClick={selectImage}
          disabled={isScanning}
        >
          <ImageIcon className={`h-3 w-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
          {t("selectImage")}
        </Button>
        
        <input 
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          capture="environment"
        />
        
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      {isScanning && (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{statusMessage}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-100" />
        </div>
      )}
      
      {progress === 100 && !isScanning && (
        <div className="text-xs text-green-600 mb-2 flex items-center justify-center">
          {language === 'ar' ? 'تم تحليل الصورة بنجاح' : 'Image analysis complete'}
        </div>
      )}
    </div>
  );
};

export default ImageToTextScanner;
