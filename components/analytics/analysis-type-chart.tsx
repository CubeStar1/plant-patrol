"use client";

import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AnalysisTypeChartProps {
  healthCount: number;
  pestCount: number;
}

const chartConfig = {
  plantHealth: {
    label: "Plant Health",
    color: "hsl(var(--chart-2))",
  },
  pestDetection: {
    label: "Pest Detection",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AnalysisTypeChart({ healthCount, pestCount }: AnalysisTypeChartProps) {
  const chartData = [
    { name: 'plantHealth', value: healthCount, fill: 'var(--color-plantHealth)' },
    { name: 'pestDetection', value: pestCount, fill: 'var(--color-pestDetection)' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Type Breakdown</CardTitle>
        <CardDescription>Ratio of plant health vs. pest detection analyses.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
