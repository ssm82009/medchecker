
import { Json } from "@/integrations/supabase/types";

export interface SearchHistory {
  id: string;
  user_id: string;
  search_query: string;
  search_results: Json;
  created_at: string;
}
