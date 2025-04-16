
import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker, Worker } from 'tesseract.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface MedicationImageUploaderProps {
  onTextExtracted: (medications: string[]) => void;
}

const MedicationImageUploader: React.FC<MedicationImageUploaderProps> = ({ onTextExtracted }) => {
  const { t, language } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const isArabic = language === 'ar';
  
  const updateProgress = (value: number) => {
    if (value > progressPercent) {
      setProgressPercent(Math.min(value, 99));
    }
  };

  const extractMedicationsFromText = (text: string): string[] => {
    console.log("Raw OCR text:", text);
    
    const cleanedText = text
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log("Cleaned text:", cleanedText);
    
    const lines = cleanedText
      .split(/[\n\r]/)
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    const medicationLines = lines.filter(line => {
      if (line.length < 3) return false;
      if (/^\d+(\.\d+)?$/.test(line)) return false;
      return true;
    });
    
    const potentialMedications: string[] = [];
    
    for (let i = 0; i < medicationLines.length; i++) {
      const line = medicationLines[i];
      const words = line.split(/\s+/);
      
      if (words.length <= 3 && line.length >= 4 && line.length <= 30) {
        potentialMedications.push(line);
      } else {
        for (const word of words) {
          if (
            (word.length >= 4 && word.length <= 25) &&
            !/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(word) &&
            !/^\d+(\.\d+)?$/.test(word)
          ) {
            potentialMedications.push(word);
          }
        }
      }
    }
    
    return [...new Set(potentialMedications)].slice(0, 5);
  };

  const preprocessImage = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    
    const averageBrightness = totalBrightness / (data.length / 4);
    const isDarkImage = averageBrightness < 100;
    
    const contrastFactor = isDarkImage ? 2.0 : 1.2;
    const brightnessAdjustment = isDarkImage ? 80 : 0;
    
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      
      const adjustedBrightness = Math.min(255, Math.max(0, (brightness - 128) * contrastFactor + 128 + brightnessAdjustment));
      
      data[i] = adjustedBrightness;
      data[i + 1] = adjustedBrightness;
      data[i + 2] = adjustedBrightness;
    }
    
    return imageData;
  };

  const optimizeTesseractSettings = async (worker: any) => {
    await worker.setParameters({
      tessedit_char_whitelist: isArabic 
        ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهو��ءأإآةىئؤ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz- '
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ',
      tessjs_create_pdf: '0',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      tessedit_pageseg_mode: 3,
      tessjs_image_dpi: '70',
      tessjs_ocr_engine_mode: '2',
    });
  };

  const processImageInSegments = async (imageFile: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setError(null);
    
    try {
      updateProgress(5);
      const image = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      image.onload = async () => {
        try {
          updateProgress(10);
          
          const maxDimension = 800;
          let width = image.width;
          let height = image.height;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.floor(height * (maxDimension / width));
              width = maxDimension;
            } else {
              width = Math.floor(width * (maxDimension / height));
              height = maxDimension;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          ctx.drawImage(image, 0, 0, width, height);
          
          const imageData = ctx.getImageData(0, 0, width, height);
          const processedData = preprocessImage(imageData);
          ctx.putImageData(processedData, 0, 0);
          
          updateProgress(25);
          updateProgress(30);
          
          // Create worker with progress tracking - Fixed implementation
          const worker = await createWorker();
          
          worker.progress((m) => {
            if (m.status === 'recognizing text') {
              const newProgress = 30 + (m.progress * 60);
              updateProgress(Math.floor(newProgress));
            }
          });
          
          updateProgress(35);
          
          const langStr = isArabic ? 'ara+eng' : 'eng+ara';
          
          await worker.load(langStr);
          
          await optimizeTesseractSettings(worker);
          
          updateProgress(35);
          
          const result = await worker.recognize(canvas);
          
          updateProgress(95);
          
          const medications = extractMedicationsFromText(result.data.text);
          
          await worker.terminate();
          
          if (medications.length === 0) {
            setError(isArabic 
              ? 'لم يتم التعرف على أي أسماء أدوية في الصورة. حاول التقاط صورة أوضح.' 
              : 'No medication names detected in the image. Try capturing a clearer image.');
            toast({
              title: isArabic ? 'تنبيه' : 'Alert',
              description: isArabic 
                ? 'لم يتم التعرف على أي أدوية. حاول مرة أخرى بصورة أوضح.' 
                : 'No medications detected. Try again with a clearer image.',
              variant: "destructive",
            });
          } else {
            onTextExtracted(medications);
            toast({
              title: isArabic ? 'تم بنجاح' : 'Success',
              description: isArabic 
                ? `تم التعرف على ${medications.length} دواء` 
                : `Detected ${medications.length} medication(s)`,
              variant: "default",
            });
          }
          
          updateProgress(100);
          
          setTimeout(() => {
            setIsProcessing(false);
            setProgressPercent(0);
          }, 500);
          
        } catch (err) {
          console.error('OCR processing error:', err);
          setError(isArabic 
            ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
            : 'An error occurred while processing the image. Please try again.');
          toast({
            title: isArabic ? 'خطأ' : 'Error',
            description: isArabic 
              ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
              : 'Error processing image. Please try again.',
            variant: "destructive",
          });
          setIsProcessing(false);
        } finally {
          URL.revokeObjectURL(imageUrl);
        }
      };
      
      image.onerror = () => {
        setError(isArabic 
          ? 'فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.' 
          : 'Failed to load the image. Please try again.');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description: isArabic 
            ? 'فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.' 
            : 'Failed to load the image. Please try again.',
          variant: "destructive",
        });
      };
      
      image.src = imageUrl;
      
    } catch (err) {
      console.error('Image processing error:', err);
      setError(isArabic 
        ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
        : 'An error occurred while processing the image. Please try again.');
      setIsProcessing(false);
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic 
          ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
          : 'Error processing image. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImageInSegments(file);
      } else {
        setError(isArabic 
          ? 'يرجى اختيار ملف صورة صالح (JPG، PNG)' 
          : 'Please select a valid image file (JPG, PNG)');
        toast({
          title: isArabic ? 'خطأ' : 'Error',
          description: isArabic 
            ? 'يرجى اختيار ملف صورة صالح (JPG، PNG)' 
            : 'Please select a valid image file (JPG, PNG)',
          variant: "destructive",
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      video.play();
      
      document.body.appendChild(video);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          processImageInSegments(file);
        }
        
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        document.body.removeChild(video);
      }, 'image/jpeg', 0.95);
      
    } catch (err) {
      console.error('Camera access error:', err);
      setError(isArabic 
        ? 'لا ��مكن الوصول إلى الكاميرا. يرجى التحقق من إذن الكاميرا أو استخدام طريقة تحميل الصور.' 
        : 'Cannot access camera. Please check camera permissions or use image upload instead.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          className="flex items-center justify-center h-16 bg-white hover:bg-gray-50" 
          onClick={triggerFileInput}
          disabled={isProcessing}
        >
          <ImageIcon className="mr-2 h-5 w-5" />
          <span>{isArabic ? 'اختيار صورة' : 'Upload Image'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center justify-center h-16 bg-white hover:bg-gray-50" 
          onClick={captureCamera}
          disabled={isProcessing}
        >
          <Camera className="mr-2 h-5 w-5" />
          <span>{isArabic ? 'التقاط صورة' : 'Capture Image'}</span>
        </Button>
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
      />
      
      {isProcessing && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 text-center">
            {isArabic ? 'جاري معالجة الصورة...' : 'Processing image...'}
            {progressPercent > 0 && ` ${progressPercent}%`}
          </p>
          <Progress 
            value={progressPercent} 
            className="h-3 bg-gray-200" 
            style={{ 
              '--progress-background': '#E5DEFF',
              '--progress-foreground': '#8B5CF6'
            } as React.CSSProperties}
          />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        {isArabic 
          ? 'صوّر علب الأدوية بوضوح لاستخراج أسمائها تلقائياً.' 
          : 'Take clear photos of medication boxes to automatically extract their names.'}
      </p>
    </div>
  );
};

export default MedicationImageUploader;
