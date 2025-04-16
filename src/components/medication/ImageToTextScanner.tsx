import React, { useState, useRef, useEffect } from 'react';
import { createWorker, PSM, RecognizeResult } from 'tesseract.js';
import { Camera, Image as ImageIcon, X, ArrowDown } from 'lucide-react';
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
  const medicationRowsRef = useRef<HTMLDivElement>(null);

  const enhanceImage = (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // تحويل للصورة الرمادية grayscale
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
          imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = avg;
        }
        ctx.putImageData(imgData, 0, 0);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
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
      // Process the image with enhancement
      const enhancedBlob = await enhanceImage(file);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImage(dataUrl);
        recognizeText(dataUrl);
      };
      
      reader.readAsDataURL(enhancedBlob);
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

  const extractMedicationNames = (result: RecognizeResult): string[] => {
    if (!result.data.words || result.data.words.length === 0) {
      return extractMedicationNamesFromText(result.data.text);
    }
    
    const blacklist = [
      'mg', 'tablet', 'tablets', 'sachet', 'sachets', 'relief', 'solution',
      'hour', 'hours', 'eyes', 'nose', 'itchy', 'skin', 'rash', 'relief',
      'capsule', 'capsules', 'suspension', 'cream', 'gel', 'injection',
      'syrup', 'ointment', 'lotion', 'drop', 'drops', 'spray'
    ];

    const blacklistRegex = new RegExp(blacklist.join('|'), 'i');
    
    const imageHeight = result.data.height || 1000;
    const topThird = imageHeight / 3;
    
    const potentialMedicationNames = result.data.words
      .filter(word => {
        const isInTopPart = word.bbox.y0 < topThird;
        const wordHeight = word.bbox.y1 - word.bbox.y0;
        const isLargeText = wordHeight > 20;
        const doesNotContainBlacklist = !blacklistRegex.test(word.text.toLowerCase());
        const matchesMedicationNamePattern = /^[A-Z][a-zA-Z0-9-]{2,}$/.test(word.text);
        
        return isInTopPart && doesNotContainBlacklist && (isLargeText || matchesMedicationNamePattern);
      })
      .map(word => word.text.trim())
      .filter(text => text.length > 2);
    
    if (potentialMedicationNames.length === 0) {
      return extractMedicationNamesFromText(result.data.text);
    }
    
    return [...new Set(potentialMedicationNames)];
  };

  const extractMedicationNamesFromText = (text: string): string[] => {
    if (!text) return [];
    
    const lines = text.split('\n');
    
    const blacklist = [
      'mg', 'tablet', 'tablets', 'sachet', 'sachets', 'relief', 'solution',
      'hour', 'hours', 'eyes', 'nose', 'itchy', 'skin', 'rash', 'relief',
      'capsule', 'capsules', 'suspension', 'cream', 'gel', 'injection'
    ];
    
    let potentialMedications = lines
      .map(line => line.trim())
      .filter(line => 
        line.length > 2 && 
        line.length < 30 && 
        !blacklist.some(term => line.toLowerCase().includes(term)) &&
        !/^\d+$/.test(line)
      );
    
    if (potentialMedications.length > 3) {
      potentialMedications = potentialMedications.slice(0, 3);
    }
    
    return potentialMedications;
  };

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
      
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });

      const result = await worker.recognize(imageData);
      
      const medicationNames = extractMedicationNames(result);
      
      if (medicationNames.length > 0) {
        onTextDetected(medicationNames.join(','));
        
        toast({
          title: language === 'ar' ? 'تم التعرف على النص' : 'Text detected',
          description: language === 'ar' 
            ? `تم العثور على ${medicationNames.length} أدوية محتملة` 
            : `Found ${medicationNames.length} potential medications`,
        });
        
        scrollToMedicationInputs();
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
      <div className="text-sm text-orange-600 mb-3 flex items-center justify-center">
        <ArrowDown className="h-3 w-3 mr-1" />
        {language === 'ar' 
          ? 'التقط صورة لعلبة الدواء بالأحرف الإنجليزية للحصول على أفضل النتائج' 
          : 'Take a picture of the medication box with English text for best results'}
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
