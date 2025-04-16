
import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Image, Upload, CheckCircle2 } from 'lucide-react';
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
    console.log("Raw OCR text:", text);
    
    // تنظيف النص
    const cleanedText = text
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // إزالة الرموز الخاصة
      .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
      .trim();
    
    console.log("Cleaned text:", cleanedText);
    
    // تقسيم النص إلى أسطر وتنظيفه
    const lines = cleanedText
      .split(/[\n\r]/)
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    console.log("Lines:", lines);
    
    // استخراج الكلمات من كل سطر واستبعاد الكلمات القصيرة جداً
    const words = lines
      .flatMap(line => line.split(/\s+/))
      .map(word => word.trim())
      .filter(word => word.length >= 3 && word.length <= 20); // معظم أسماء الأدوية بين 3 و 20 حرفاً
    
    console.log("Words:", words);
    
    // تصفية الكلمات المحتملة أن تكون أسماء أدوية
    const potentialMedications = words.filter(word => {
      // تخطي الأرقام
      if (/^\d+(\.\d+)?$/.test(word)) return false;
      
      // تخطي الكلمات الشائعة غير المتعلقة بالأدوية (مثل حروف الجر...)
      const commonWords = isArabic ? 
        ['في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'تلك', 'ذلك', 'كان', 'كانت', 'يجب', 'هل', 'نعم', 'لا'] :
        ['the', 'and', 'for', 'with', 'this', 'that', 'was', 'were', 'should', 'would', 'could', 'yes', 'not'];
        
      if (commonWords.includes(word.toLowerCase())) return false;
      
      return true;
    });
    
    console.log("Potential medications:", potentialMedications);
    
    // إزالة التكرارات
    const uniqueMedications = [...new Set(potentialMedications)];
    
    // إرجاع أسماء الأدوية المحتملة (أو أقل إذا كان عدد النتائج أقل)
    return uniqueMedications.slice(0, 8);
  };

  const preprocessImage = (image: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // الحفاظ على النسبة الأصلية للصورة
    canvas.width = image.width;
    canvas.height = image.height;
    
    if (ctx) {
      // رسم الصورة الأصلية
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // تطبيق معالجات تحسين الصورة لـ OCR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // تحسين التباين وتحويل إلى أبيض وأسود بطريقة أفضل
      for (let i = 0; i < data.length; i += 4) {
        // استخراج قيم RGB
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // تحويل إلى تدرج الرمادي مع مراعاة تأثير كل لون
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        
        // زيادة التباين وتوضيح الحواف
        const threshold = 150; // عتبة التحويل للأبيض والأسود
        const newValue = gray > threshold ? 255 : 0;
        
        // تطبيق القيم الجديدة
        data[i] = newValue;     // R
        data[i + 1] = newValue; // G
        data[i + 2] = newValue; // B
      }
      
      // رسم الصورة المعالجة
      ctx.putImageData(imageData, 0, 0);
    }
    
    return canvas;
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setError(null);
    
    try {
      // تحميل الصورة في عنصر img للمعالجة المسبقة
      const image = new Image();
      image.src = URL.createObjectURL(imageFile);
      
      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
      });
      
      // معالجة الصورة لتحسين دقة التعرف على النص
      const processedCanvas = preprocessImage(image);
      
      // تحويل Canvas إلى Blob
      const processedImageBlob = await new Promise<Blob | null>((resolve) => {
        processedCanvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
      });
      
      if (!processedImageBlob) {
        throw new Error('Failed to process image');
      }
      
      // تهيئة Tesseract worker مع اللغة المناسبة
      const worker = await createWorker(language === 'ar' ? 'ara+eng' : 'eng+ara', 1, {
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setProgressPercent(progress.progress * 100);
          }
        },
      });
      
      // زيادة دقة التعرف على النص
      await worker.setParameters({
        tessedit_char_whitelist: isArabic 
          ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءأإآةىئؤ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessedit_pageseg_mode: '6', // التعرف على النص كمجموعة كلمات
      });
      
      // التعرف على النص من الصورة المعالجة
      const result = await worker.recognize(processedImageBlob);
      await worker.terminate();
      
      // استخراج أسماء الأدوية من النص
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // استخدام الكاميرا الخلفية إن أمكن
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      video.srcObject = stream;
      video.play();
      
      // إنشاء عنصر الفيديو في الصفحة مؤقتاً للتقاط الصورة
      document.body.appendChild(video);
      
      // انتظار للتأكد من أن الفيديو جاهز
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
