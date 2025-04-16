
import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker } from 'tesseract.js';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface MedicationImageUploaderProps {
  onTextExtracted: (medications: string[]) => void;
}

const MedicationImageUploader: React.FC<MedicationImageUploaderProps> = ({ onTextExtracted }) => {
  const { t, language } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isArabic = language === 'ar';
  
  const extractMedicationsFromText = (text: string): string[] => {
    // تقسيم النص إلى أسطر وتنظيفه
    const lines = text
      .split(/[\n\r]/)
      .map(line => line.trim())
      .filter(line => line.length > 3);
    
    // إزالة الأسطر التي تحتوي أرقاماً فقط أو نصوصاً قصيرة جداً
    const potentialMedications = lines.filter(line => {
      // تخطي الأسطر التي تحتوي على أرقام فقط
      if (/^\d+(\.\d+)?$/.test(line)) return false;
      
      // تخطي الأسطر القصيرة جداً إلا إذا كانت تبدو كإسم دواء
      if (line.length < 4) return false;
      
      return true;
    });
    
    // إرجاع أول 5 أسماء أدوية محتملة (أو أقل إذا كان عدد النتائج أقل)
    return potentialMedications.slice(0, 5);
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setError(null);
    
    try {
      const worker = await createWorker(language === 'ar' ? 'ara' : 'eng', 1, {
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setProgressPercent(progress.progress * 100);
          }
        },
      });
      
      const result = await worker.recognize(imageFile);
      await worker.terminate();
      
      const medications = extractMedicationsFromText(result.data.text);
      
      if (medications.length === 0) {
        setError(isArabic 
          ? 'لم يتم التعرف على أي أسماء أدوية في الصورة. حاول التقاط صورة أوضح.' 
          : 'No medication names detected in the image. Try capturing a clearer image.');
      } else {
        onTextExtracted(medications);
      }
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(isArabic 
        ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
        : 'An error occurred while processing the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        setError(isArabic 
          ? 'يرجى اختيار ملف صورة صالح (JPG، PNG)' 
          : 'Please select a valid image file (JPG, PNG)');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      video.play();
      
      // إنشاء عنصر الفيديو في الصفحة مؤقتاً للتقاط الصورة
      document.body.appendChild(video);
      
      // انتظار للتأكد من أن الفيديو جاهز
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // تعيين أبعاد Canvas لتتناسب مع الفيديو
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // رسم الإطار الحالي على Canvas
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // تحويل Canvas إلى ملف صورة
      canvas.toBlob(blob => {
        if (blob) {
          // إنشاء ملف من البلوب
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          processImage(file);
        }
        
        // تنظيف الموارد
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        document.body.removeChild(video);
      }, 'image/jpeg', 0.95);
      
    } catch (err) {
      console.error('Camera access error:', err);
      setError(isArabic 
        ? 'لا يمكن الوصول إلى الكاميرا. يرجى التحقق من إذن الكاميرا أو استخدام طريقة تحميل الصور.' 
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
          <Image className="mr-2 h-5 w-5" />
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
          </p>
          <Progress value={progressPercent} className="h-2" />
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
