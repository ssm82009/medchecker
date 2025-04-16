
import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Camera, Image as ImageIcon, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createWorker, PSM, Rectangle } from 'tesseract.js';
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
    
    console.log("Lines:", lines);
    
    const medicationLines = lines.filter(line => {
      if (line.length < 3) return false;
      if (/^\d+(\.\d+)?$/.test(line)) return false;
      return true;
    });
    
    const potentialMedications: string[] = [];
    
    for (let i = 0; i < medicationLines.length; i++) {
      const line = medicationLines[i];
      const words = line.split(/\s+/);
      
      if (words.length <= 3 && line.length >= 4 && line.length <= 25) {
        if (!/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(line)) {
          potentialMedications.push(line);
        }
      } else {
        for (const word of words) {
          if (
            (word.length >= 4 && word.length <= 20) &&
            !/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(word) &&
            !/^\d+(\.\d+)?$/.test(word)
          ) {
            if (!isArabic && /^[A-Z]/.test(word)) {
              potentialMedications.push(word);
            } else if (isArabic && words.indexOf(word) < 3) {
              potentialMedications.push(word);
            }
          }
        }
      }
    }
    
    console.log("Potential medications before filtering:", potentialMedications);
    
    const brandNamePattern = isArabic 
      ? /^[أ-ي]{3,}$/ 
      : /^[A-Z][a-z]{2,}$|^[A-Z]+$/;
    
    const prioritizedMeds = potentialMedications.filter(med => 
      brandNamePattern.test(med) || med.length >= 5
    );
    
    const allMeds = [...new Set([...prioritizedMeds, ...potentialMedications])];
    console.log("Final medications found:", allMeds);
    
    const result: string[] = [];
    
    if (allMeds.length > 1) {
      return allMeds.slice(0, 5);
    } else if (allMeds.length === 1) {
      return allMeds;
    }
    
    const longWords = cleanedText
      .split(/\s+/)
      .filter(word => word.length >= 4 && word.length <= 20)
      .slice(0, 3);
    
    return longWords.length > 0 ? longWords : ['لم يتم العثور على أدوية'];
  };

  const preprocessImage = (image: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    if (ctx) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        
        const threshold = 150;
        const newValue = gray > threshold ? 255 : 0;
        
        data[i] = newValue;
        data[i + 1] = newValue;
        data[i + 2] = newValue;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    return canvas;
  };

  const processImageInSegments = async (imageFile: File) => {
    setIsProcessing(true);
    setProgressPercent(0);
    setError(null);
    
    try {
      const image = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      image.onload = async () => {
        try {
          const processedCanvas = preprocessImage(image);
          
          const processedImageBlob = await new Promise<Blob | null>((resolve) => {
            processedCanvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
          });
          
          if (!processedImageBlob) {
            throw new Error('Failed to process image');
          }
          
          const fullWidth = processedCanvas.width;
          const fullHeight = processedCanvas.height;
          
          // Define regions for OCR processing
          const regions: Rectangle[] = [
            { left: 0, top: 0, width: fullWidth, height: fullHeight },
            { left: 0, top: 0, width: fullWidth, height: fullHeight / 2 },
            { left: 0, top: fullHeight / 2, width: fullWidth, height: fullHeight / 2 },
          ];
          
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
          
          // Process each region with proper progress updates
          for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            const progressStart = (i / regions.length) * 90;
            const progressEnd = ((i + 1) / regions.length) * 90;
            
            // Update progress at the beginning of each region
            setProgressPercent(progressStart);
            
            // Ensure the UI updates before continuing
            await new Promise(resolve => setTimeout(resolve, 50));
            
            try {
              const result = await worker.recognize(processedImageBlob, {
                rectangle: region
              });
              
              allText += result.data.text + '\n';
              
              // Update progress after each region is processed
              setProgressPercent(progressEnd);
              
              // Ensure the UI updates before continuing
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (err) {
              console.error(`Error recognizing region ${i}:`, err);
            }
          }
          
          await worker.terminate();
          
          const medications = extractMedicationsFromText(allText);
          
          setProgressPercent(100);
          
          // Ensure the UI updates before continuing
          await new Promise(resolve => setTimeout(resolve, 100));
          
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
          : 'An error occurred while processing the image. Please try again.',
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
