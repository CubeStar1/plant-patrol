"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PestDetection } from '@/lib/types/database-types';

interface PestDistributionChartProps {
  pestData: PestDetection[];
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#ffc658"];

export default function PestDistributionChart({ pestData }: PestDistributionChartProps) {
  const pestCounts = pestData
    .flatMap(d => d.detections.map(det => det.label.toLowerCase()))
    .reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

  const chartData = Object.entries(pestCounts)
    .map(([pest, count]) => ({ pest, count }))
    .sort((a, b) => b.count - a.count);

  if (chartData.length === 0) {
    return null; // Don't render the chart if there's no pest data
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pest Distribution</CardTitle>
        <CardDescription>Frequency of each detected pest across all submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer>
            <BarChart layout="vertical" data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="pest"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className='capitalize'
              />
              <XAxis dataKey="count" type="number" hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" layout="vertical" radius={5}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
