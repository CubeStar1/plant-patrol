// Base interface for a single bounding box detection
export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  label: string;
}

// Interface for the full pest detection record
export interface PestDetection {
  id: string;
  user_id: string;
  created_at: string;
  image_url: string;
  detections: BoundingBox[];
}

// Interfaces for plant health analysis results
interface Suggestion {
  id: string;
  name: string;
  probability: number;
  similar_images: { id: string; url: string; similarity: number; url_with_metadata: string }[];
}

interface Classification {
  suggestions: Suggestion[];
}

interface Disease {
  suggestions: Suggestion[];
}

interface HealthAssessment {
  is_plant: { probability: number; binary: boolean };
  is_healthy: { probability: number; binary: boolean };
  disease: Disease;
}

// Interface for the full plant health analysis record
export interface PlantHealthAnalysis {
  id: string;
  user_id: string;
  created_at: string;
  image_url: string;
  result: {
    result: { // Note the nested 'result' property
      classification: Classification;
      health_assessment: HealthAssessment;
    }
  };
}

// Combined type for use in history and analytics components
export type CombinedHistoryData = (PlantHealthAnalysis & { type: 'Plant Health' }) | (PestDetection & { type: 'Pest Detection' });
