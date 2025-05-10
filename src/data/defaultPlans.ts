
import { PlanType } from '../types/plan';

export const defaultPlans: PlanType[] = [
  {
    code: 'visitor',
    name: 'Visitor Plan',
    nameAr: 'باقة الزائر',
    description: 'Basic features for unregistered users',
    descriptionAr: 'ميزات أساسية للمستخدمين غير المسجلين',
    price: 0,
    features: [
      'Check up to 2 medications',
      'Basic interaction analysis'
    ],
    featuresAr: [
      'فحص حتى دوائين',
      'تحليل أساسي للتفاعلات'
    ],
    isDefault: false
  },
  {
    code: 'basic',
    name: 'Basic Plan',
    nameAr: 'الباقة الأساسية',
    description: 'Free basic plan for registered users',
    descriptionAr: 'الباقة الأساسية المجانية للمستخدمين المسجلين',
    price: 0,
    features: [
      'Check up to 5 medications',
      'Basic interaction analysis'
    ],
    featuresAr: [
      'فحص حتى 5 أدوية',
      'تحليل أساسي للتفاعلات'
    ],
    isDefault: true
  },
  {
    code: 'pro',
    name: 'Professional Plan',
    nameAr: 'الباقة الاحترافية',
    description: 'Advanced features for healthcare professionals',
    descriptionAr: 'مميزات متقدمة للمهنيين الصحيين',
    price: 9.99,
    features: [
      'Check up to 10 medications',
      'Advanced interaction analysis',
      'Image-based medication search',
      'Patient medication history'
    ],
    featuresAr: [
      'فحص حتى 10 أدوية',
      'تحليل متقدم للتفاعلات',
      'البحث عن الأدوية بالصور',
      'سجل أدوية المريض'
    ],
    isDefault: false
  }
]; 
