"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { KindwiseResult } from "@/lib/types";
import { Sprout, ShieldCheck } from "lucide-react";
import React from "react";

interface ResultSummaryCardsProps {
  result: KindwiseResult;
}

export const ResultSummaryCards: React.FC<ResultSummaryCardsProps> = ({
  result,
}) => {
  console.log(result.is_plant);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Card className="p-6 bg-blue-500 text-primary-foreground">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">Is Plant?</CardTitle>
          <Sprout className="h-8 w-8 opacity-80" />
        </div>
        <p className="text-5xl font-bold mt-2">
          {(result.is_plant.probability * 100).toFixed(1)}%
        </p>
      </Card>
      <Card className="p-6 bg-green-600 text-primary-foreground">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">Is Healthy?</CardTitle>
          <ShieldCheck className="h-8 w-8 opacity-80" />
        </div>
        <p className="text-5xl font-bold mt-2">
          {(result.is_healthy.probability * 100).toFixed(1)}%
        </p>
      </Card>
    </div>
  );
};
