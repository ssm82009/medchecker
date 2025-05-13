
import { Json } from "@/integrations/supabase/types";

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  plan_code: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  search_query: string;
  search_results: Json;
  created_at: string;
}

// إضافة واجهة جديدة لمعلومات الكاش
export interface CacheInfo {
  lastUpdated: number;
  version: string;
}
