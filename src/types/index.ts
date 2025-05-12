

export interface PlanType {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  features: string[];
  featuresAr: string[];
  isDefault: boolean;
}

export interface MedicationInput {
  name: string;
  dosage?: string;
}

export interface Medication {
  id: string;
  name: string;
  active_ingredient: string;
  dosage_form: string;
  route_of_administration: string;
  strength: string;
  manufacturer: string;
  country_of_origin: string;
  atc_code: string;
  marketing_status: string;
}

export interface Interaction {
  id: string;
  description: string;
  severity: string;
  document_url: string;
  medication1_id: string;
  medication2_id: string;
}

export interface AppearanceSettings {
  id: number;
  logo_text: string;
  logo_icon: string;
  navbar_color: string;
  footer_color: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  theme: 'light' | 'dark' | 'purple' | 'blue' | 'green';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_type: 'one_time' | 'recurring';
  payment_provider: 'paypal' | 'stripe';
  provider_transaction_id?: string;
  plan_code: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  search_query: string;
  search_results: any;
  created_at: string;
}
