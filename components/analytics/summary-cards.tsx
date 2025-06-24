import * as React from 'react';
import { BarChart, Bug, Leaf, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PlantHealthAnalysis, PestDetection } from "@/lib/types/database-types";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactElement<{ className?: string }>;
  cardClassName?: string; // For gradient background
}

const SingleStatsCard: React.FC<StatsCardProps> = ({ title, value, icon, description, cardClassName }) => {
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out hover:scale-[1.02] border-0", cardClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-white">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-white/20">
          {React.cloneElement(icon, {
            className: cn(icon.props.className, "h-5 w-5", "text-white/90")
          })}
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <div className="text-3xl font-bold text-white">{value}</div>
        {description && <p className="text-xs text-white/80 pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

interface SummaryCardsProps {
  healthData: PlantHealthAnalysis[];
  pestData: PestDetection[];
}

const dashboardCardStyles = [
  { bg: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" },
  { bg: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" },
  { bg: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" },
  { bg: "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" },
];

export default function SummaryCards({ healthData, pestData }: SummaryCardsProps) {
  const totalSubmissions = healthData.length + pestData.length;
  const uniquePests = new Set(pestData.flatMap(d => d.detections.map(det => det.label.toLowerCase())));

  const statsToDisplay = [
    {
      title: "Total Submissions",
      value: totalSubmissions.toString(),
      description: "All-time analysis count",
      icon: <ScanLine />,
      cardClassName: dashboardCardStyles[0].bg,
    },
    {
      title: "Plant Health Analyses",
      value: healthData.length.toString(),
      description: "Total health checks performed",
      icon: <Leaf />,
      cardClassName: dashboardCardStyles[1].bg,
    },
    {
      title: "Pest Detections",
      value: pestData.length.toString(),
      description: "Total pest scans performed",
      icon: <Bug />,
      cardClassName: dashboardCardStyles[2].bg,
    },
    {
      title: "Unique Pests Found",
      value: uniquePests.size.toString(),
      description: "Distinct types of pests identified",
      icon: <BarChart />,
      cardClassName: dashboardCardStyles[3].bg,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsToDisplay.map((stat) => (
        <SingleStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          cardClassName={stat.cardClassName}
        />
      ))}
    </div>
  );
}
