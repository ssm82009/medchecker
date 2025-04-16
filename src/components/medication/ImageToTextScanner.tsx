
import React, { useState, useRef } from 'react';
import { createWorker, PSM } from 'tesseract.js';
import { Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

interface ImageToTextScannerProps {
  onTextDetected: (text: string) => void;
}

const ImageToTextScanner: React.FC<ImageToTextScannerProps> = ({ onTextDetected }) => {
  const { t, language, dir } = useTranslation();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProgress(0);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      recognizeText(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const selectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    setImage(null);
    setProgress(0);
    setIsScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const recognizeText = async (imageData: string) => {
    setIsScanning(true);
    
    try {
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });
      
      await worker.loadLanguage('ara+eng');
      await worker.initialize('ara+eng');
      
      // Set only valid parameters in setParameters
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

      // Pass options directly without the oem property
      const { data } = await worker.recognize(imageData);
      
      const detectedText = data.text.trim();
      
      const potentialMedications = detectedText
        .split(/[\n,،]+/)
        .map(text => text.trim())
        .filter(text => text.length > 2 && !/^\d+$/.test(text));
      
      if (potentialMedications.length > 0) {
        onTextDetected(potentialMedications.join(','));
        
        toast({
          title: language === 'ar' ? 'تم التعرف على النص' : 'Text detected',
          description: language === 'ar' 
            ? `تم العثور على ${potentialMedications.length} أدوية محتملة` 
            : `Found ${potentialMedications.length} potential medications`,
        });
      } else {
        toast({
          title: language === 'ar' ? 'تحذير' : 'Warning',
          description: language === 'ar' 
            ? 'لم يتم العثور على أي نص واضح، حاول التقاط صورة أوضح' 
            : 'No clear text found, try taking a clearer picture',
          variant: "destructive"
        });
      }
      
      await worker.terminate();
      
    } catch (error) {
      console.error('Error recognizing text:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء معالجة الصورة' 
          : 'Error processing the image',
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setProgress(100);
    }
  };

  return (
    <div className={`mt-2 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
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
          <Image className={`h-3 w-3 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
          {t("selectImage")}
        </Button>
        
        {/* إدخال الكاميرا المخصص */}
        <input 
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          capture="environment"
        />
        
        {/* إدخال الصورة العادي */}
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      {image && (
        <div className="relative mb-3 border rounded-md overflow-hidden">
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-70 hover:opacity-100 z-10"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
          <img 
            src={image} 
            alt={t("selectedImage")} 
            className="w-full h-auto max-h-40 object-contain bg-gray-100" 
          />
        </div>
      )}
      
      {isScanning && (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>{t("analyzingImage")}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-100" />
        </div>
      )}
      
      {progress === 100 && !isScanning && (
        <div className="text-xs text-green-600 mb-2">
          {t("imageAnalysisComplete")}
        </div>
      )}
    </div>
  );
};

export default ImageToTextScanner;
