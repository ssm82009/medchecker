
import { PlanType } from '../types/plan';

export const defaultPlans: PlanType[] = [
  {
    code: 'visitor',
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
    code: 'basic',
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
    code: 'pro',
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
  {
    code: 'pro12',
    name: 'Annual Pro',
    nameAr: 'الباقة الاحترافية السنوية',
    description: 'Annual professional plan with all features at a discounted price.',
    descriptionAr: 'الباقة الاحترافية السنوية مع جميع الميزات بسعر مخفض.',
    price: 29,
    features: [
      'All Pro features',
      'Annual billing',
      'Save 84% compared to monthly billing',
    ],
    featuresAr: [
      'جميع ميزات الباقة الاحترافية',
      'فاتورة سنوية',
      'وفر 84% مقارنة بالدفع الشهري',
    ],
  },
  {
    code: 'annual',
    name: 'Annual Pro',
    nameAr: 'الاحترافية السنوية',
    description: 'Annual subscription with all pro features at a discounted rate.',
    descriptionAr: 'اشتراك سنوي مع جميع ميزات الباقة الاحترافية بسعر مخفض.',
    price: 150,
    features: [
      'All Pro plan features',
      'Save with annual billing',
      'Priority support',
    ],
    featuresAr: [
      'جميع ميزات الباقة الاحترافية',
      'وفر المال مع الفاتورة السنوية',
      'دعم ذو أولوية',
    ],
  },
]; 
