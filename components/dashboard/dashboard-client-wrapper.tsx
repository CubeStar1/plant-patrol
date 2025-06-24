'use client';

import { PestDetection, PlantHealthAnalysis } from '@/lib/types/database-types';
import SummaryCard from './summary-card';
import DetectionCard from './detection-card';

interface DashboardClientWrapperProps {
  healthData: PlantHealthAnalysis[];
  pestData: PestDetection[];
}

import { BarChart, Bug, Leaf, ScanLine } from "lucide-react";

const dashboardCardStyles = [
  { bg: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" },
  { bg: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" },
  { bg: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" },
  { bg: "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" },
];

const DashboardClientWrapper = ({ healthData, pestData }: DashboardClientWrapperProps) => {
  const totalPestDetections = pestData.length;
  const totalDiseaseDetections = healthData.length;
  const uniquePests = new Set(pestData.flatMap(p => p.detections?.map(d => d.label) || [])).size;
  const uniqueDiseases = new Set(healthData.flatMap(h => h.result?.result?.classification?.suggestions.map(s => s.name) || [])).size;

  const statsToDisplay = [
    {
      title: "Total Pest Detections",
      value: totalPestDetections.toString(),
      description: "All-time pest scans",
      icon: <Bug />,
      cardClassName: dashboardCardStyles[2].bg,
    },
    {
      title: "Unique Pests Found",
      value: uniquePests.toString(),
      description: "Distinct types of pests identified",
      icon: <BarChart />,
      cardClassName: dashboardCardStyles[3].bg,
    },
    {
      title: "Total Disease Detections",
      value: totalDiseaseDetections.toString(),
      description: "All-time health checks",
      icon: <Leaf />,
      cardClassName: dashboardCardStyles[1].bg,
    },
    {
      title: "Unique Diseases Found",
      value: uniqueDiseases.toString(),
      description: "Distinct types of diseases identified",
      icon: <ScanLine />,
      cardClassName: dashboardCardStyles[0].bg,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsToDisplay.map((stat) => (
          <SummaryCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            cardClassName={stat.cardClassName}
          />
        ))}
      </div>

      {/* Detections Grid */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pest Detections</h2>
          <div className="grid gap-6 mt-4 md:grid-cols-2">
            {pestData.map((detection) => (
              <DetectionCard key={detection.id} detection={detection} type="pest" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Disease Detections</h2>
          <div className="grid gap-6 mt-4 md:grid-cols-2">
            {healthData.map((analysis) => (
              <DetectionCard key={analysis.id} detection={analysis} type="disease" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClientWrapper;
