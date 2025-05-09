
export type PlanType = {
  id?: string; // إضافة معرف يمكن أن يكون اختيارياً
  code: string; // visitor, basic, pro
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // بالدولار
  features: string[];
  featuresAr: string[];
  isDefault?: boolean;
}; 
