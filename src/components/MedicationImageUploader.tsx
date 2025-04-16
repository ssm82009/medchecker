import React, { useState, useRef, useEffect } from 'react';
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
  
  // More granular progress tracking
  const updateProgressWithDelay = (value: number) => {
    // Enforce a minimum delay between progress updates for smoother experience
    requestAnimationFrame(() => {
      setProgressPercent(Math.min(value, 99)); // Cap at 99% until complete
      document.body.dataset.progress = String(value);
    });
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
    
    console.log("Lines:", lines);
    
    // Enhanced medication line detection with better regex patterns
    const medicationLines = lines.filter(line => {
      if (line.length < 3) return false;
      if (/^\d+(\.\d+)?$/.test(line)) return false;
      return true;
    });
    
    const potentialMedications: string[] = [];
    
    // Improved medication detection patterns
    for (let i = 0; i < medicationLines.length; i++) {
      const line = medicationLines[i];
      const words = line.split(/\s+/);
      
      // Detect standalone brand names (short lines with few words)
      if (words.length <= 3 && line.length >= 4 && line.length <= 30) {
        if (!/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(line)) {
          potentialMedications.push(line);
        }
      } else {
        // Extract individual brand names from longer lines
        for (const word of words) {
          if (
            (word.length >= 4 && word.length <= 25) &&
            !/^(\d+\s*(مجم|ملغ|mg|gram|جرام))$/i.test(word) &&
            !/^\d+(\.\d+)?$/.test(word)
          ) {
            if (!isArabic && /^[A-Z]/.test(word)) {
              potentialMedications.push(word);
            } else if (isArabic && words.indexOf(word) < 4) {
              potentialMedications.push(word);
            }
          }
        }
      }
    }
    
    console.log("Potential medications before filtering:", potentialMedications);
    
    // Enhanced pattern matching for medication brand names
    const brandNamePattern = isArabic 
      ? /^[أ-ي]{3,}$|^كتافاست$|^فيكسوفينادين$|^نوفارتيس$/i
      : /^[A-Z][a-z]{2,}$|^[A-Z]+$|^Catafast$|^Fexofenadine$|^Novartis$/i;
    
    const prioritizedMeds = potentialMedications.filter(med => 
      brandNamePattern.test(med) || med.length >= 5
    );
    
    const allMeds = [...new Set([...prioritizedMeds, ...potentialMedications])];
    console.log("Final medications found:", allMeds);
    
    // Better results handling
    if (allMeds.length > 1) {
      return allMeds.slice(0, 5);
    } else if (allMeds.length === 1) {
      return allMeds;
    }
    
    // Fallback to extract any word that might be a medication
    const longWords = cleanedText
      .split(/\s+/)
      .filter(word => word.length >= 4 && word.length <= 20)
      .slice(0, 3);
    
    return longWords.length > 0 ? longWords : [isArabic ? 'لم يتم العثور على أدوية' : 'No medications found'];
  };

  // Enhanced image preprocessing for better handling of dark images
  const preprocessImage = (image: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    if (ctx) {
      // Draw the original image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate image brightness to detect if it's a dark image
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      
      const averageBrightness = totalBrightness / (data.length / 4);
      const isDarkImage = averageBrightness < 100; // Threshold for dark image detection
      
      // Apply appropriate processing based on image brightness
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate perceived brightness using luminance formula
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Adjust threshold for dark images
        const threshold = isDarkImage ? 80 : 150;
        const contrastFactor = isDarkImage ? 1.5 : 1.0;
        
        // Apply contrast enhancement for dark images
        let adjustedGray = gray;
        if (isDarkImage) {
          // Enhance contrast for dark images
          adjustedGray = Math.min(255, Math.max(0, (gray - 128) * contrastFactor + 128));
        }
        
        // Apply thresholding for better OCR text detection
        const newValue = adjustedGray > threshold ? 255 : 0;
        
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
      updateProgressWithDelay(5);
      const image = new Image();
      const imageUrl = URL.createObjectURL(imageFile);
      
      image.onload = async () => {
        try {
          updateProgressWithDelay(10);
          
          // Process image with enhanced preprocessing
          const processedCanvas = preprocessImage(image);
          updateProgressWithDelay(20);
          
          // Faster transition to next processing step
          const processedImageBlob = await new Promise<Blob | null>((resolve) => {
            processedCanvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
          });
          
          if (!processedImageBlob) {
            throw new Error('Failed to process image');
          }
          
          updateProgressWithDelay(25);
          
          // More focused regions for OCR scanning
          const fullWidth = processedCanvas.width;
          const fullHeight = processedCanvas.height;
          
          // Create multiple smaller regions for parallel processing
          const regions: Rectangle[] = [
            // Full image at lower resolution for context
            { left: 0, top: 0, width: fullWidth, height: fullHeight },
            
            // Top half - often contains medication name
            { left: 0, top: 0, width: fullWidth, height: fullHeight / 2 },
            
            // Middle section - focused on medication name area
            { left: 0, top: fullHeight * 0.2, width: fullWidth, height: fullHeight * 0.4 },
          ];
          
          updateProgressWithDelay(30);
          
          // Load worker with appropriate language models
          const worker = await createWorker(language === 'ar' ? 'ara+eng' : 'eng+ara');
          updateProgressWithDelay(40);
          
          // Set OCR parameters for better medication text recognition
          await worker.setParameters({
            tessedit_char_whitelist: isArabic 
              ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهويءأإآةىئؤ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz- '
              : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ',
            tessjs_create_pdf: '0',
            tessjs_create_hocr: '0',
            tessjs_create_tsv: '0',
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
            tessjs_image_dpi: '150', // Optimize DPI for faster processing
          });
          
          updateProgressWithDelay(50);
          
          let allText = '';
          
          // Process regions with more responsive progress updates
          for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            const progressStart = 50 + ((i / regions.length) * 40); // More progress space for OCR
            const progressEnd = 50 + (((i + 1) / regions.length) * 40);
            
            updateProgressWithDelay(Math.floor(progressStart));
            
            try {
              const result = await worker.recognize(processedImageBlob, {
                rectangle: region
              });
              
              // Update progress during OCR processing
              const midProgress = (progressStart + progressEnd) / 2;
              updateProgressWithDelay(Math.floor(midProgress));
              
              allText += result.data.text + '\n';
              updateProgressWithDelay(Math.floor(progressEnd));
            } catch (err) {
              console.error(`Error recognizing region ${i}:`, err);
            }
          }
          
          await worker.terminate();
          updateProgressWithDelay(90);
          
          // Extract medications with improved algorithm
          const medications = extractMedicationsFromText(allText);
          updateProgressWithDelay(95);
          
          if (medications.length === 0 || (medications.length === 1 && medications[0].includes('لم يتم العثور'))) {
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
          
          // Complete the progress indication
          updateProgressWithDelay(100);
          
          setTimeout(() => {
            setIsProcessing(false);
            setProgressPercent(0);
          }, 1000);
          
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
