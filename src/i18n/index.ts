
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
      payWithPaypal: "Pay with PayPal",
      
      // Admin panel translations
      adminPanel: "Admin Panel",
      aiSettings: "AI Settings",
      subscriptions: "Subscriptions",
      users: "Users",
      supportTickets: "Support Tickets",
      aiModel: "AI Model",
      apiKey: "API Key",
      enableAI: "Enable AI",
      maxTokens: "Max Tokens",
      saveSettings: "Save Settings",
      subscriptionManagement: "Subscription Management",
      monthlyPrice: "Monthly Price ($)",
      yearlyPrice: "Yearly Price ($)",
      paypalClientId: "PayPal Client ID",
      enablePayments: "Enable Payments",
      userManagement: "User Management",
      id: "ID",
      name: "Name",
      email: "Email",
      status: "Status",
      plan: "Plan",
      actions: "Actions",
      edit: "Edit",
      delete: "Delete",
      active: "Active",
      inactive: "Inactive",
      premium: "Premium",
      free: "Free",
      user: "User",
      subject: "Subject",
      date: "Date",
      view: "View",
      reply: "Reply",
      open: "Open",
      pending: "Pending",
      closed: "Closed",
      
      // Profile translations
      myProfile: "My Profile",
      profile: "Profile",
      subscription: "Subscription",
      checkHistory: "Check History",
      support: "Support",
      profileInformation: "Profile Information",
      updateProfileDesc: "Update your account information and preferences",
      password: "Password",
      preferredLanguage: "Preferred Language",
      saveChanges: "Save Changes",
      activeUntil: "Active Until",
      month: "month",
      managePlan: "Manage Plan",
      paymentHistory: "Payment History",
      cancelSubscription: "Cancel Subscription",
      checkHistoryDesc: "View your previous medication interaction checks",
      medications: "Medications",
      result: "Result",
      noInteraction: "No Interaction",
      potentialInteraction: "Potential Interaction",
      severeInteraction: "Severe Interaction",
      viewDetails: "View Details",
      submitSupportTicket: "Submit Support Ticket",
      supportTicketDesc: "Need help? Submit a support ticket and we'll respond as soon as possible",
      message: "Message",
      ticketSubjectPlaceholder: "Brief description of your issue",
      ticketMessagePlaceholder: "Please provide details about your issue or question...",
      supportResponseTime: "Our team typically responds within 24-48 hours during business days.",
      submitTicket: "Submit Ticket",
      
      // 404 page
      pageNotFound: "Page Not Found",
      pageNotFoundDesc: "Sorry, the page you're looking for doesn't exist or has been moved.",
      returnHome: "Return Home"
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
      payWithPaypal: "الدفع عبر باي بال",
      
      // Admin panel translations
      adminPanel: "لوحة الإدارة",
      aiSettings: "إعدادات الذكاء الاصطناعي",
      subscriptions: "الاشتراكات",
      users: "المستخدمون",
      supportTickets: "تذاكر الدعم",
      aiModel: "نموذج الذكاء الاصطناعي",
      apiKey: "مفتاح API",
      enableAI: "تفعيل الذكاء الاصطناعي",
      maxTokens: "الحد الأقصى للرموز",
      saveSettings: "حفظ الإعدادات",
      subscriptionManagement: "إدارة الاشتراكات",
      monthlyPrice: "السعر الشهري ($)",
      yearlyPrice: "السعر السنوي ($)",
      paypalClientId: "معرف عميل PayPal",
      enablePayments: "تفعيل المدفوعات",
      userManagement: "إدارة المستخدمين",
      id: "المعرف",
      name: "الاسم",
      email: "البريد الإلكتروني",
      status: "الحالة",
      plan: "الخطة",
      actions: "الإجراءات",
      edit: "تعديل",
      delete: "حذف",
      active: "نشط",
      inactive: "غير نشط",
      premium: "مميز",
      free: "مجاني",
      user: "المستخدم",
      subject: "الموضوع",
      date: "التاريخ",
      view: "عرض",
      reply: "رد",
      open: "مفتوح",
      pending: "قيد الانتظار",
      closed: "مغلق",
      
      // Profile translations
      myProfile: "ملفي الشخصي",
      profile: "الملف الشخصي",
      subscription: "الاشتراك",
      checkHistory: "سجل الفحوصات",
      support: "الدعم",
      profileInformation: "معلومات الملف الشخصي",
      updateProfileDesc: "تحديث معلومات حسابك وتفضيلاتك",
      password: "كلمة المرور",
      preferredLanguage: "اللغة المفضلة",
      saveChanges: "حفظ التغييرات",
      activeUntil: "نشط حتى",
      month: "شهر",
      managePlan: "إدارة الخطة",
      paymentHistory: "سجل المدفوعات",
      cancelSubscription: "إلغاء الاشتراك",
      checkHistoryDesc: "عرض فحوصات تفاعل الأدوية السابقة",
      medications: "الأدوية",
      result: "النتيجة",
      noInteraction: "لا توجد تفاعلات",
      potentialInteraction: "تفاعل محتمل",
      severeInteraction: "تفاعل خطير",
      viewDetails: "عرض التفاصيل",
      submitSupportTicket: "تقديم تذكرة دعم",
      supportTicketDesc: "بحاجة إلى مساعدة؟ قدم تذكرة دعم وسنرد في أقرب وقت ممكن",
      message: "الرسالة",
      ticketSubjectPlaceholder: "وصف موجز لمشكلتك",
      ticketMessagePlaceholder: "يرجى تقديم تفاصيل حول مشكلتك أو سؤالك...",
      supportResponseTime: "يرد فريقنا عادة خلال 24-48 ساعة خلال أيام العمل.",
      submitTicket: "تقديم التذكرة",
      
      // 404 page
      pageNotFound: "الصفحة غير موجودة",
      pageNotFoundDesc: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
      returnHome: "العودة للرئيسية"
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
