
import html2canvas from 'html2canvas';

export const captureAndShare = async (elementRef: React.RefObject<HTMLElement>, title: string) => {
  if (!elementRef.current) return;

  try {
    const canvas = await html2canvas(elementRef.current);
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Add watermark
      ctx.save();
      
      // Set watermark style
      ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Calculate center position
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Add دواء آمن
      ctx.font = 'bold 24px Arial';
      ctx.fillText('دواء آمن', centerX, centerY - 15);
      
      // Add dwaa.app
      ctx.font = '20px Arial';
      ctx.fillText('dwaa.app', centerX, centerY + 15);
      
      ctx.restore();
    }

    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });

    if (navigator.share) {
      const file = new File([imageBlob], 'medication-interactions.png', { type: 'image/png' });
      await navigator.share({
        title,
        files: [file]
      });
    } else {
      // Fallback: download the image if sharing is not supported
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'medication-interactions.png';
      link.click();
    }
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};
