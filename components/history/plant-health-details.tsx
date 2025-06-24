import { ResultSummaryCards } from "@/components/plant-health/result-summary-cards";
import { PlantClassification } from "@/components/plant-health/plant-classification";
import { DiseaseSuggestions } from "@/components/plant-health/disease-suggestions";

interface PlantHealthDetailsProps {
  result: any; // The result from the DB is the full API response object
}

export default function PlantHealthDetails({ result: analysisResponse }: PlantHealthDetailsProps) {
  // The actual result data is nested inside a 'result' property
  const resultData = analysisResponse?.result;

  // Add a guard clause in case the data is missing or malformed
  if (!resultData || !resultData.is_plant) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Could not display analysis results. The data may be incomplete.
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <ResultSummaryCards result={resultData} />
      {resultData.classification && (
        <PlantClassification classification={resultData.classification} />
      )}
      {resultData.disease && (
        <DiseaseSuggestions disease={resultData.disease} highlightedSuggestion={null} />
      )}
    </div>
  );
}
