export interface SimilarImage {
  id: string;
  url: string;
  license_name: string;
  license_url: string;
  citation: string;
  similarity: number;
  url_small: string;
}

export interface Treatment {
  biological?: string[];
  prevention?: string[];
}

export interface DiseaseDetails {
  language: string;
  entity_id: string;
  treatment?: Treatment;
  local_name?: string | null;
  description?: { value: string };
  url?: string | null;
  classification?: any | null;
  common_names?: string[] | null;
  cause?: string | null;
}

export interface KindwiseSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images?: SimilarImage[];
  details: DiseaseDetails;
}

export interface IsPlant {
  probability: number;
  threshold: number;
  binary: boolean;
}

export interface IsHealthy {
  probability: number;
  threshold: number;
  binary: boolean;
}

export interface Disease {
  suggestions: KindwiseSuggestion[];
  question?: Question;
}

export interface QuestionOption {
  suggestion_index: number;
  entity_id: string;
  name: string;
  translation: string;
}

export interface Question {
  text: string;
  translation: string;
  options: {
    yes: QuestionOption;
    no: QuestionOption;
  };
}

export interface KindwiseResult {
  is_plant: IsPlant;
  is_healthy: IsHealthy;
  disease: Disease;
  classification?: Classification;
}

export interface ClassificationSuggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: SimilarImage[];
  details: {
    language: string;
    entity_id: string;
    description?: { value: string };
    url?: string;
    common_names?: string[];
    taxonomy?: {
      class: string;
      family: string;
      genus: string;
      kingdom: string;
      order: string;
      phylum: string;
    };
  };
}

export interface Classification {
  suggestions: ClassificationSuggestion[];
}

export interface KindwiseResponse {
  access_token: string;
  model_version: string;
  custom_id: string | null;
  input: any;
  result: KindwiseResult;
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}
  
