
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  errorMessage 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>خطأ في حفظ الإعدادات</DialogTitle>
          <DialogDescription>
            <div className="mt-2">
              <p>{errorMessage}</p>
              <p className="mt-2">تأكد من تسجيل الدخول كمشرف وأن لديك الصلاحيات المناسبة.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDialog;
