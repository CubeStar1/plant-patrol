"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KindwiseResponse, Question } from "@/lib/types";
import { Leaf } from "lucide-react";
import React from "react";
import { InteractiveQuestion } from "./interactive-question";
import { PlantClassification } from "./plant-classification";
import { DiseaseSuggestions } from "./disease-suggestions";
import { ResultSummaryCards } from "./result-summary-cards";

interface AnalysisResultsProps {
  prediction: KindwiseResponse | null;
  error: string | null;
  activeQuestion: Question | null;
  answered: boolean;
  highlightedSuggestion: number | null;
  onQuestionAnswer: (answer: "yes" | "no") => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  prediction,
  error,
  activeQuestion,
  answered,
  highlightedSuggestion,
  onQuestionAnswer,
}) => {
  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <h3 className="font-medium text-red-800 dark:text-red-300">Error</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
        </div>
      )}

      {activeQuestion && !answered && (
        <InteractiveQuestion
          activeQuestion={activeQuestion}
          onQuestionAnswer={onQuestionAnswer}
        />
      )}

      {prediction && prediction.result && !error && (
        <div className="space-y-6">
          <ResultSummaryCards result={prediction.result} />

          {prediction.result.classification && (
            <PlantClassification
              classification={prediction.result.classification}
            />
          )}

          <DiseaseSuggestions
            disease={prediction.result.disease}
            highlightedSuggestion={highlightedSuggestion}
          />
        </div>
      )}
    </div>
  );
};
