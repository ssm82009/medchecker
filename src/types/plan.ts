
export type PlanType = {
  id?: string;
  code: string; // visitor, basic, pro, pro12, annual
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // بالدولار
  features: string[];
  featuresAr: string[];
  isDefault?: boolean;
}; 
