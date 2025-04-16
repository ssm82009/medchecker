
import React, { useState, useRef } from 'react';
import { createWorker, PSM } from 'tesseract.js';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve) => {
      const imgElement = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      imgElement.onload = () => {
        const ratio = imgElement.width > maxWidth ? maxWidth / imgElement.width : 1;
        canvas.width = imgElement.width * ratio;
        canvas.height = imgElement.height * ratio;
        ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      
      imgElement.src = URL.createObjectURL(file);
    });
  };

  const updateStatusMessage = () => {
    const messages = language === 'ar' 
      ? [
          "⏳ جاري قراءة النص...",
          "🔍 نحاول فهم الحروف...",
          "📋 التحليل جاري...",
          "🧠 نعالج البيانات...",
          "📑 يتم استخراج الأدوية..."
        ]
      : [
          "⏳ Reading text...",
          "🔍 Trying to understand characters...",
          "📋 Analysis in progress...",
          "🧠 Processing data...",
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
      // Resize image before processing
      const resizedBlob = await resizeImage(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImage(dataUrl);
        recognizeText(dataUrl);
      };
      
      reader.readAsDataURL(resizedBlob);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsScanning(false);
    }
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
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  // Set up message interval during scanning
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      updateStatusMessage();
      interval = setInterval(updateStatusMessage, 2500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, language]);

  const recognizeText = async (imageData: string) => {
    setIsScanning(true);
    setProgress(0);
    
    try {
      const worker = await createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          } else if (m.status === 'loading tesseract core') {
            setProgress(5);
          } else if (m.status === 'initializing tesseract') {
            setProgress(15);
          } else if (m.status === 'loading language traineddata') {
            setProgress(30);
          } else if (m.status === 'initializing api') {
            setProgress(50);
          }
        },
      });
      
      // Use single language for faster processing
      const langToUse = language === 'ar' ? 'ara' : 'eng';
      await worker.loadLanguage(langToUse);
      await worker.initialize(langToUse);
      
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });

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
            <span>{statusMessage}</span>
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
