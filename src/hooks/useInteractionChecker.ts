
// في هذا الملف، يجب إصلاح خطأ TypeScript في التخزين في التاريخ

// عندما نصل إلى سطر الإدخال في قاعدة البيانات، نحتاج إلى تحويل النوع
// من InteractionResult إلى Json بأمان

// يُمكننا استخدام تحويل مزدوج من خلال unknown لتجنب خطأ التحويل
const searchRecord = {
  user_id: userId,
  search_query: query,
  search_results: parsedResult as unknown as Json
};

// ثم نقوم بإدراج السجل في جدول search_history
const { error: insertError } = await supabase
  .from('search_history')
  .insert(searchRecord);
