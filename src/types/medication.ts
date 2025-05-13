
export interface AISettingsType {
  apiKey: string;
  model: string;
}

export interface MedicationInput {
  name: string;
  dosage?: string;
}

export interface Medication {
  id: string;
  name: string;
}

export interface PatientInfo {
  age: string;
  weight: string;
  allergies: string;
  healthCondition: string;
}

export interface InteractionResult {
  hasInteractions: boolean;
  interactions?: string[];
  alternatives?: string[];
  ageWarnings?: string[];
}
