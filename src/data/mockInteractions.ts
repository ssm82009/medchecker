
import { InteractionResult } from '@/types/medication';

export const MOCK_INTERACTIONS: Record<string, InteractionResult> = {
  'أسبرين+باراسيتامول': {
    hasInteractions: true,
    interactions: [
      'قد يزيد من خطر النزيف عند تناول الأسبرين مع الباراسيتامول لفترات طويلة',
      'يمكن أن يقلل الأسبرين من فعالية الباراسيتامول'
    ],
    alternatives: [
      'يمكن استخدام الإيبوبروفين (الاسم التجاري: بروفين، أدفيل) بدلاً من الأسبرين',
      'استشر الطبيب قبل الجمع بين هذه الأدوية'
    ],
    ageWarnings: [
      'الأسبرين غير مناسب للأطفال تحت سن 12 سنة بسبب خطر متلازمة راي',
      'باراسيتامول: يجب تعديل الجرعة حسب العمر والوزن'
    ]
  },
  'أموكسيسيلين+أوميبرازول': {
    hasInteractions: true,
    interactions: [
      'قد يقلل أوميبرازول من امتصاص أموكسيسيلين',
      'ينصح بترك فاصل زمني بين تناول الدوائين'
    ],
    alternatives: [
      'يمكن استخدام رانيتيدين (الاسم التجاري: زانتاك) بدلاً من أوميبرازول (الاسم التجاري: بريلوسيك)',
      'تناول أموكسيسيلين (الاسم التجاري: موكسيبين، أموكسيل) قبل ساعتين على الأقل من أوميبرازول'
    ],
    ageWarnings: [
      'أموكسيسيلين: يجب تعديل الجرعة للأطفال حسب الوزن والعمر',
      'أوميبرازول: غير موصى به عادة للأطفال أقل من سنة واحدة'
    ]
  },
  'وارفارين+إيبوبروفين': {
    hasInteractions: true,
    interactions: [
      'زيادة خطر النزيف الشديد عند الجمع بين وارفارين وإيبوبروفين',
      'تأثير خطير على تخثر الدم'
    ],
    alternatives: [
      'استخدم الباراسيتامول (الاسم التجاري: بنادول، تايلينول) بدلاً من الإيبوبروفين مع وارفارين',
      'استشر الطبيب قبل استخدام أي مسكن مع وارفارين (الاسم التجاري: كومادين)'
    ],
    ageWarnings: [
      'وارفارين: يتطلب مراقبة دقيقة لتخثر الدم وغير مناسب للأطفال إلا تحت إشراف طبي صارم',
      'إيبوبروفين: غير مناسب للأطفال أقل من 6 أشهر'
    ]
  },
  '�������فادول+بنادول': {
    hasInteractions: true,
    interactions: [
      'كلا الدوائين يحتويان على الباراسيتامول مما قد يؤدي إلى جرعة زائدة',
      'ز����دة خطر تضرر الكبد عند تناول جرعات عالية من الباراسيتامول'
    ],
    alternatives: [
      'استخدم أحد الدوائين فقط وليس كليهما (فيفادول أو بنادول)',
      'يمكن استخدام الإيبوبروفين (الاسم التجاري: بروفين، أدفيل) كبديل لأحد الدوائين'
    ],
    ageWarnings: [
      'باراسيتامول: يجب تعديل الجرعة للأطفال حسب العمر والوزن',
      'تجنب استخدام جرعات عالية من الباراسيتامول للأطفال'
    ]
  },
  'روفيناك+كاتافاست': {
    hasInteractions: true,
    interactions: [
      'كلا الدوائين ينتميان إلى مضادات الالتهاب غير الستيرويدية مما يزيد من الآثار الجانبية',
      'زيادة خطر مشاكل المعدة والنزيف الهضمي',
      'قد يؤثر سلبًا على وظائف الكلى خاصة لمرضى السكري'
    ],
    alternatives: [
      'استخدم أحد الدوائين فقط وليس كليهما (روفيناك أو كاتافاست)',
      'يمكن استخدام الباراسيتامول (الاسم التجاري: بنادول، تايلينول) كبديل أكثر أمانًا للألم'
    ],
    ageWarnings: [
      'مضادات الالتهاب غير الستيرويدية غير موصى بها عادة للأطفال أقل من 12 سنة إلا بوصفة طبية',
      'لا ينصح باستخدام روفيناك للأطفال تحت سن 14 سنة'
    ]
  },
  'روفيناك+بنادول': {
    hasInteractions: true,
    interactions: [
      'قد يزيد من خطر حدوث آثار جانبية على الجهاز الهضمي',
      'قد يكون له تأثير على مرضى السكري'
    ],
    alternatives: [
      'استشر الطبيب حول الجرعة المناسبة',
      'يمكن استخدام مسكنات بديلة مثل الاسيتامينوفين فقط (الاسم التجاري: تايلينول) تحت إشراف طبي'
    ],
    ageWarnings: [
      'روفيناك (الاسم التجاري: فولتارين): غير مناسب للأطفال تحت سن 14 سنة',
      'بنادول: يجب تعديل الجرعة للأطفال حسب العمر والوزن'
    ]
  }
};

export const MOCK_INTERACTIONS_EN: Record<string, InteractionResult> = {
  'aspirin+paracetamol': {
    hasInteractions: true,
    interactions: [
      'May increase the risk of bleeding when taking aspirin with paracetamol for extended periods',
      'Aspirin can reduce the effectiveness of paracetamol'
    ],
    alternatives: [
      'Ibuprofen (Brand names: Advil, Motrin) can be used instead of aspirin',
      'Consult your doctor before combining these medications'
    ],
    ageWarnings: [
      'Aspirin is not suitable for children under 12 years due to the risk of Reye\'s syndrome',
      'Paracetamol: Dosage should be adjusted according to age and weight'
    ]
  },
  'amoxicillin+omeprazole': {
    hasInteractions: true,
    interactions: [
      'Omeprazole may reduce the absorption of amoxicillin',
      'It is recommended to leave a time gap between taking the two medications'
    ],
    alternatives: [
      'Ranitidine (Brand name: Zantac) can be used instead of omeprazole (Brand name: Prilosec)',
      'Take amoxicillin (Brand names: Amoxil, Moxatag) at least two hours before omeprazole'
    ],
    ageWarnings: [
      'Amoxicillin: Dosage should be adjusted for children based on weight and age',
      'Omeprazole: Not usually recommended for children under one year'
    ]
  },
  'warfarin+ibuprofen': {
    hasInteractions: true,
    interactions: [
      'Increased risk of severe bleeding when combining warfarin and ibuprofen',
      'Serious effect on blood clotting'
    ],
    alternatives: [
      'Use paracetamol (Brand names: Tylenol, Panadol) instead of ibuprofen with warfarin',
      'Consult your doctor before using any pain reliever with warfarin (Brand name: Coumadin)'
    ],
    ageWarnings: [
      'Warfarin: Requires careful monitoring of blood clotting and not suitable for children except under strict medical supervision',
      'Ibuprofen: Not suitable for children under 6 months'
    ]
  },
  'fevadol+panadol': {
    hasInteractions: true,
    interactions: [
      'Both medications contain paracetamol which may lead to overdose',
      'Increased risk of liver damage when taking high doses of paracetamol'
    ],
    alternatives: [
      'Use only one of the medications, not both (Fevadol or Panadol)',
      'Ibuprofen (Brand names: Advil, Motrin) can be used as an alternative to one of the medications'
    ],
    ageWarnings: [
      'Paracetamol: Dosage should be adjusted for children based on age and weight',
      'Avoid high doses of paracetamol for children'
    ]
  },
  'roufinac+catafast': {
    hasInteractions: true,
    interactions: [
      'Both drugs belong to NSAIDs which increases side effects',
      'Increased risk of stomach problems and gastrointestinal bleeding',
      'May negatively affect kidney function especially for diabetic patients'
    ],
    alternatives: [
      'Use only one of the medications, not both (Roufinac or Catafast)',
      'Paracetamol (Brand names: Tylenol, Panadol) can be used as a safer alternative for pain'
    ],
    ageWarnings: [
      'NSAIDs are not usually recommended for children under 12 years unless prescribed',
      'Roufinac not recommended for children under 14 years'
    ]
  },
  'roufinac+panadol': {
    hasInteractions: true,
    interactions: [
      'May increase the risk of gastrointestinal side effects',
      'May have an effect on diabetic patients'
    ],
    alternatives: [
      'Consult your doctor about the appropriate dosage',
      'Alternative pain relievers such as acetaminophen only (Brand name: Tylenol) can be used under medical supervision'
    ],
    ageWarnings: [
      'Roufinac (Brand name: Voltaren): Not suitable for children under 14 years',
      'Panadol: Dosage should be adjusted for children based on age and weight'
    ]
  }
};
