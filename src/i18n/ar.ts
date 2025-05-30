import { en } from './en';

const ar = {
  ...en,
  // Original modified keys
  enterMedication: 'أدخل الأدوية التي تريد التحقق منها بكتابة أسمائها أو استخراجها عن طريق الصور',
  patientInfo: 'معلومات المريض (اختياري)',
  
  // Add Arabic translations for other keys as needed
  appTitle: 'فاحص تفاعلات الأدوية',
  about: 'من نحن',
  termsOfUse: 'شروط الاستخدام',
  privacyPolicy: 'سياسة الخصوصية',
  copyright: 'حقوق النشر',
  contactUs: 'اتصل بنا',
  languageSwitch: 'تغيير اللغة',
  
  addMedication: 'إضافة دواء',
  checkInteractions: 'التحقق من التفاعلات',
  loading: 'جاري التحميل...',
  medicationName: 'اسم الدواء',
  scanMedicationsFromImage: 'استخراج أسماء الأدوية من الصورة',
  captureImage: 'التقاط صورة',
  selectImage: 'تحميل صورة',
  imageAnalysisComplete: 'اكتمل تحليل الصورة!',
  
  age: 'العمر',
  enterAge: 'أدخل العمر',
  weight: 'الوزن',
  selectWeight: 'أدخل الوزن',
  allergies: 'الحساسية',
  enterAllergies: 'أدخل الحساسية',
  healthCondition: 'الحالات الصحية',
  enterHealthCondition: 'أدخل الحالات الصحية',
  
  interactionsFound: 'تم العثور على تفاعلات',
  noInteractionsFound: 'لم يتم العثور على تفاعلات',
  noInteractions: 'لم يتم اكتشاف أي تفاعلات بين هذه الأدوية.',
  ageWarnings: 'تحذيرات متعلقة بالعمر',
  alternatives: 'أدوية بديلة',
  disclaimer: 'تُقدَّم هذه المعلومات عبر تطبيق « دواء آمن dwaa.app » لأغراض تعليمية، ولا تُغني عن استشارة الطبيب المختص!',
  
  login: 'تسجيل الدخول',
  loginButton: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  forUsers: 'دخول الأعضاء المسجلين ',
  loginSuccess: 'تم تسجيل الدخول بنجاح',
  loginFailed: 'فشل تسجيل الدخول',
  welcomeBack: 'مرحبًا بعودتك!',
  invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صالحة',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  
  saveSuccess: 'نجاح',
  settingsSaved: 'تم حفظ الإعدادات بنجاح',
  adSaved: 'تم حفظ الإعلان بنجاح',
  secondaryAdSaved: 'تم حفظ الإعلان الثانوي بنجاح',
  logoSaved: 'تم حفظ نص الشعار بنجاح',
  error: 'خطأ',
  aiSettings: 'إعدادات الذكاء الاصطناعي',
  apiKey: 'مفتاح API',
  model: 'النموذج',
  saveSettings: 'حفظ الإعدادات',
  logoSettings: 'إعدادات الشعار',
  logoText: 'نص الشعار',
  saveLogo: 'حفظ الشعار',
  advertisement: 'الإعلان',
  secondaryAdvertisement: 'إعلان التذييل',
  saveAd: 'حفظ الإعلان',
  saveSecondaryAd: 'حفظ إعلان التذييل',
  dashboard: 'لوحة القيادة',
  
  // New keys for static pages functionality
  save: 'حفظ',
  cancel: 'إلغاء',
  edit: 'تعديل',
  contentSaved: 'تم حفظ المحتوى بنجاح',

  // Static Pages Titles
  aboutTitle: 'من نحن',
  termsTitle: 'شروط الاستخدام',
  privacyTitle: 'سياسة الخصوصية',
  copyrightTitle: 'حقوق النشر',
  contactTitle: 'معلومات الاتصال',
  
  // Error messages - new keys (Arabic translations)
  contentFetchError: 'فشل في جلب المحتوى. يرجى المحاولة مرة أخرى لاحقًا.',
  pageIdMissing: 'معرف الصفحة مفقود، لا يمكن حفظ المحتوى.',
  updatePermissionError: 'ليس لديك صلاحية لتحديث هذا المحتوى.',
  noAccount: 'ليس لديك حساب؟ إنشاء حساب جديد',
};

export default ar;
