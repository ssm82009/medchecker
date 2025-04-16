
import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Image as ImageIcon, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker, PSM } from 'tesseract.js';
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
    
    // تحليل كل سطر للبحث عن أسماء الأدوية المحتملة
    const medicationLines = lines.filter(line => {
      // تخطي الأسطر القصيرة جدًا
      if (line.length < 3) return false;
      
      // تخطي الأسطر التي تحتوي فقط على أرقام
      if (/^\d+(\.\d+)?$/.test(line)) return false;
      
      return true;
    });
    
    // استخراج أسماء الأدوية المحتملة من كل سطر
    // البحث عن الأسطر التي تحتوي على نص بخط كبير (عادة أسماء الأدوية)
    const potentialMedications: string[] = [];
    
    for (let i = 0; i < medicationLines.length; i++) {
      const line = medicationLines[i];
      const words = line.split(/\s+/);
      
      // بالنسبة للأسطر القصيرة بكلمة واحدة أو كلمتين، اعتبرها أسماء أدوية محتملة
      if (words.length <= 3 && line.length >= 4 && line.length <= 25) {
        // استبعاد الأسطر التي تحتوي على كلمات شائعة مثل "مجم" أو "ملغ" أو "mg" فقط
        if (!/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(line)) {
          potentialMedications.push(line);
        }
      } 
      // بالنسبة للأسطر الطويلة، ابحث عن الكلمات الفردية التي قد تكون أسماء أدوية
      else {
        for (const word of words) {
          if (
            (word.length >= 4 && word.length <= 20) && // معظم أسماء الأدوية بين 4 و 20 حرفًا
            !/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(word) && // استبعاد الأوزان
            !/^\d+(\.\d+)?$/.test(word) // استبعاد الأرقام
          ) {
            // إعطاء أولوية للكلمات التي تبدأ بحرف كبير في اللغة الإنجليزية
            if (!isArabic && /^[A-Z]/.test(word)) {
              potentialMedications.push(word);
            }
            // إعطاء أولوية للكلمات العربية التي تظهر في بداية السطر
            else if (isArabic && words.indexOf(word) < 3) {
              potentialMedications.push(word);
            }
          }
        }
      }
    }
    
    console.log("Potential medications before filtering:", potentialMedications);
    
    // تحسين: اكتشاف أسماء الأدوية بناءً على الخط الكبير
    // هذا يعتمد على فرضية أن أسماء الأدوية عادة ما تظهر بخط كبير في العلبة
    const brandNamePattern = isArabic 
      ? /^[أ-ي]{3,}$/  // نمط للبحث عن الكلمات العربية
      : /^[A-Z][a-z]{2,}$|^[A-Z]+$/;  // نمط للبحث عن الكلمات الإنجليزية التي تبدأ بحرف كبير
    
    const prioritizedMeds = potentialMedications.filter(med => 
      brandNamePattern.test(med) || med.length >= 5
    );
    
    // دمج النتائج وإزالة التكرارات
    const allMeds = [...new Set([...prioritizedMeds, ...potentialMedications])];
    console.log("Final medications found:", allMeds);
    
    // تقسيم الصورة إلى أقسام افتراضية لاكتشاف عدة علب
    // بناءً على الافتراض أن كل قسم من النص يمثل علبة دواء مختلفة
    const result: string[] = [];
    
    // إذا كان هناك أسطر كثيرة، افترض أن كل مجموعة من الأسطر المتتالية قد تنتمي لعلبة مختلفة
    if (allMeds.length > 1) {
      // إضافة أسماء الأدوية المحتملة مع الحد الأقصى 5 أدوية
      return allMeds.slice(0, 5);
    } else if (allMeds.length === 1) {
      return allMeds;
    }
    
    // فشل في العثور على أي أسماء أدوية، إرجاع الكلمات الطويلة من النص
    const longWords = cleanedText
      .split(/\s+/)
      .filter(word => word.length >= 4 && word.length <= 20)
      .slice(0, 3);
    
    return longWords.length > 0 ? longWords : ['لم يتم العثور على أدوية'];
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

  const processImageInSegments = async (imageFile: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setError(null);
    
    try {
      // تحميل الصورة في عنصر img للمعالجة المسبقة
      const image = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      image.onload = async () => {
        try {
          // معالجة الصورة لتحسين دقة التعرف على النص
          const processedCanvas = preprocessImage(image);
          
          // تحويل Canvas إلى Blob
          const processedImageBlob = await new Promise<Blob | null>((resolve) => {
            processedCanvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
          });
          
          if (!processedImageBlob) {
            throw new Error('Failed to process image');
          }
          
          // تقسيم الصورة إلى قسمين (أعلى وأسفل) للتعرف على عدة علب دواء
          const fullWidth = processedCanvas.width;
          const fullHeight = processedCanvas.height;
          
          // إنشاء عدة مناطق محتملة للتعرف على النص
          const regions = [
            { x: 0, y: 0, width: fullWidth, height: fullHeight },  // الصورة كاملة
            { x: 0, y: 0, width: fullWidth, height: fullHeight / 2 },  // النصف العلوي
            { x: 0, y: fullHeight / 2, width: fullWidth, height: fullHeight / 2 },  // النصف السفلي
          ];
          
          // تهيئة Tesseract worker
          const worker = await createWorker(language === 'ar' ? 'ara+eng' : 'eng+ara');
          
          await worker.setParameters({
            tessedit_char_whitelist: isArabic 
              ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءأإآةىئؤ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
              : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ',
            tessjs_create_pdf: '0',
            tessjs_create_hocr: '0',
            tessjs_create_tsv: '0',
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
          });
          
          let allText = '';
          
          // التعرف على النص في كل منطقة
          for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            setProgressPercent((i / regions.length) * 90);  // تقدم حتى 90%
            
            try {
              const result = await worker.recognize(processedImageBlob, {
                rectangle: region
              });
              
              allText += result.data.text + '\n';
            } catch (err) {
              console.error(`Error recognizing region ${i}:`, err);
              // استمر في المحاولة للمناطق الأخرى حتى لو فشلت إحداها
            }
          }
          
          await worker.terminate();
          
          // استخراج أسماء الأدوية من النص
          const medications = extractMedicationsFromText(allText);
          
          setProgressPercent(100);
          
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
          URL.revokeObjectURL(imageUrl);
        }
      };
      
      image.onerror = () => {
        setError(isArabic 
          ? 'فشل في تحميل الصورة. يرجى المحاولة مرة أخرى.' 
          : 'Failed to load the image. Please try again.');
        setIsProcessing(false);
        URL.revokeObjectURL(imageUrl);
      };
      
      image.src = imageUrl;
      
    } catch (err) {
      console.error('Image processing error:', err);
      setError(isArabic 
        ? 'حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.' 
        : 'An error occurred while processing the image. Please try again.');
      setIsProcessing(false);
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
          processImageInSegments(file);
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
