import { PlanType } from '../types/plan';

export const defaultPlans: PlanType[] = [
  {
    id: 'visitor',
    name: 'Visitor',
    nameAr: 'زائر',
    description: 'Free plan for unregistered users. Limited features.',
    descriptionAr: 'خطة مجانية للزوار غير المسجلين بميزات محدودة.',
    price: 0,
    features: [
      'Check up to 2 medications per search',
      'No image search',
      'No history',
    ],
    featuresAr: [
      'التحقق من تداخل دوائين فقط في كل عملية بحث',
      'لا يمكن البحث باستخدام الصور',
      'لا يوجد سجل للمريض',
    ],
    isDefault: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    nameAr: 'الأساسية',
    description: 'Basic plan for registered users. More features and history.',
    descriptionAr: 'الباقة الأساسية للمستخدمين المسجلين. مزايا أكثر وسجل للمريض.',
    price: 5,
    features: [
      'Check up to 5 medications per search',
      'Patient history',
      'No image search',
    ],
    featuresAr: [
      'التحقق من تداخل حتى 5 أدوية في كل عملية بحث',
      'سجل للمريض',
      'لا يمكن البحث باستخدام الصور',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'الاحترافية',
    description: 'Professional plan with all features, including AI image search.',
    descriptionAr: 'الباقة الاحترافية مع جميع الميزات، بما في ذلك البحث بالصور بالذكاء الاصطناعي.',
    price: 15,
    features: [
      'Check up to 10 medications per search',
      'Patient history',
      'AI-powered image search',
    ],
    featuresAr: [
      'التحقق من تداخل حتى 10 أدوية في كل عملية بحث',
      'سجل للمريض',
      'البحث عن الأدوية باستخدام الصور والذكاء الاصطناعي',
    ],
  },
]; 