
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // English translations
      appTitle: "MedChecker",
      checkInteractions: "Check Interactions",
      addMedication: "Add Medication",
      medicationName: "Medication Name",
      medicalContext: "Medical Context (optional)",
      interactionResults: "Interaction Results",
      noInteractions: "No interactions found",
      subscribeMessage: "Subscribe for unlimited checks",
      subscribeNow: "Subscribe Now",
      language: "Language",
      freeLimit: "Free plan allows checking up to 3 medications",
      subscriptionDetails: "Subscription: $9/month or $90/year",
      payWithPaypal: "Pay with PayPal"
    }
  },
  ar: {
    translation: {
      // Arabic translations
      appTitle: "فاحص الأدوية",
      checkInteractions: "تحقق من التفاعلات",
      addMedication: "إضافة دواء",
      medicationName: "اسم الدواء",
      medicalContext: "السياق الطبي (اختياري)",
      interactionResults: "نتائج التفاعل",
      noInteractions: "لم يتم العثور على تفاعلات",
      subscribeMessage: "اشترك للحصول على فحوصات غير محدودة",
      subscribeNow: "اشترك الآن",
      language: "اللغة",
      freeLimit: "تسمح الخطة المجانية بفحص حتى 3 أدوية",
      subscriptionDetails: "الاشتراك: 9 دولار/شهر أو 90 دولار/سنة",
      payWithPaypal: "الدفع عبر باي بال"
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    react: {
      useSuspense: false // This prevents issues with SSR
    }
  });

export default i18n;
