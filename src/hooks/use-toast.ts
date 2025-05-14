
import { useToast as useShadcnToast, toast as shadcnToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

export const useToast = useShadcnToast;

export const toast = (props: any) => {
  // Use Sonner for simpler toast implementation
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  
  if (props.title) {
    return sonnerToast(props.title, {
      description: props.description,
      duration: props.duration || 5000,
      action: props.action,
    });
  }
  
  return sonnerToast(props);
};
