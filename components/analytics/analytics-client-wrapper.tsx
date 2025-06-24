"use client";

import { PlantHealthAnalysis, PestDetection } from "@/lib/types/database-types";
import SummaryCards from "./summary-cards";
import SubmissionsOverTimeChart from "./submissions-over-time-chart";
import AnalysisTypeChart from "./analysis-type-chart";
import PestDistributionChart from "./pest-distribution-chart";
import HistoryDataTable from "./history-data-table";

interface AnalyticsClientWrapperProps {
  healthData: PlantHealthAnalysis[];
  pestData: PestDetection[];
}

export default function AnalyticsClientWrapper({ healthData, pestData }: AnalyticsClientWrapperProps) {
  const combinedData = [
    ...healthData.map(d => ({ ...d, type: 'Plant Health' as const })),
    ...pestData.map(d => ({ ...d, type: 'Pest Detection' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-8">
      <SummaryCards healthData={healthData} pestData={pestData} />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SubmissionsOverTimeChart data={combinedData} />
        </div>
        <AnalysisTypeChart healthCount={healthData.length} pestCount={pestData.length} />
      </div>
      <PestDistributionChart pestData={pestData} />
      <HistoryDataTable data={combinedData} />
    </div>
  );
}
