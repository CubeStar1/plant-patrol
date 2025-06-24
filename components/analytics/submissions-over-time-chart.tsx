"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartData {
  date: string;
  submissions: number;
}

interface SubmissionsOverTimeChartProps {
  data: { created_at: string }[];
}

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function SubmissionsOverTimeChart({ data }: SubmissionsOverTimeChartProps) {
  const processedData = data.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(d => d.date === date);
    if (existing) {
      existing.submissions++;
    } else {
      acc.push({ date, submissions: 1 });
    }
    return acc;
  }, [] as ChartData[]).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions Over Time</CardTitle>
        <CardDescription>Your analysis submission frequency over the last few days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={processedData} margin={{ top: 20, right: 20, left: -5, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="submissions" fill="var(--color-submissions)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
