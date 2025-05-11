import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComments } from "@/hooks/useComments";

interface CommentChartsProps {
  videoId: string;
}

export default function CommentCharts({ videoId }: CommentChartsProps) {
  const [timeRange, setTimeRange] = React.useState("all");

  // For charts, we need all comments, not just paginated ones
  const {
    data: commentsResponse,
    isLoading,
    error,
  } = useComments(videoId, {
    limit: 500, // Request larger batch for charting
    sortBy: "published_at",
    sortOrder: "asc",
  });

  if (isLoading) {
    return <div className="mt-8">Loading comment analytics...</div>;
  }

  if (error) {
    return (
      <div className="mt-8 text-red-500">
        Failed to load comment analytics: {error.message}
      </div>
    );
  }

  if (!commentsResponse || commentsResponse.comments.length === 0) {
    return null;
  }

  // Process comments to create time-series data
  const commentsByDate = commentsResponse.comments.reduce(
    (acc, comment) => {
      // Extract just the date part (YYYY-MM-DD)
      const date = comment.published_at.split("T")[0];

      if (!acc[date]) {
        acc[date] = {
          date,
          positive: 0,
          negative: 0,
          neutral: 0,
          ambiguous: 0,
        };
      }

      switch (comment.sentiment_label.toLowerCase()) {
        case "positive":
          acc[date].positive += 1;
          break;
        case "negative":
          acc[date].negative += 1;
          break;
        case "neutral":
          acc[date].neutral += 1;
          break;
        default:
          acc[date].ambiguous += 1;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        date: string;
        positive: number;
        negative: number;
        neutral: number;
        ambiguous: number;
      }
    >
  );

  // Convert to array and sort by date
  let chartData = Object.values(commentsByDate).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter data based on selected time range
  if (timeRange !== "all") {
    const today = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(today.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(today.getDate() - 90);
        break;
    }

    chartData = chartData.filter((item) => new Date(item.date) >= startDate);
  }

  // Chart configuration for the stacked area chart
  const chartConfig = {
    sentiment: {
      label: "Sentiment",
    },
    positive: {
      label: "Positive",
      color: "hsl(var(--chart-2))",
    },
    neutral: {
      label: "Neutral",
      color: "hsl(var(--chart-1))",
    },
    negative: {
      label: "Negative",
      color: "hsl(var(--chart-3))",
    },
    ambiguous: {
      label: "Ambiguous",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  // Show progress indicator if we're still analyzing comments
  const analysisInProgress = commentsResponse.analysis_state === "in_progress";
  const progressPercent =
    commentsResponse.total_available > 0
      ? Math.round(
          (commentsResponse.total_analyzed / commentsResponse.total_available) *
            100
        )
      : 0;
  return (
    <section className="mt-8 grid gap-6">
      {/* Area Chart for sentiment over time */}
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Sentiment Trends</CardTitle>
            <CardDescription>
              Sentiment analysis of comments over time
              {analysisInProgress && ` (${progressPercent}% analyzed)`}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Select time range"
            >
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All time
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {chartData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-positive)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-positive)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-neutral)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-neutral)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-negative)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-negative)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillAmbiguous"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-ambiguous)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-ambiguous)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: string) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="ambiguous"
                  type="natural"
                  fill="url(#fillAmbiguous)"
                  stroke="var(--color-ambiguous)"
                  stackId="1"
                />
                <Area
                  dataKey="negative"
                  type="natural"
                  fill="url(#fillNegative)"
                  stroke="var(--color-negative)"
                  stackId="1"
                />
                <Area
                  dataKey="neutral"
                  type="natural"
                  fill="url(#fillNeutral)"
                  stroke="var(--color-neutral)"
                  stackId="1"
                />
                <Area
                  dataKey="positive"
                  type="natural"
                  fill="url(#fillPositive)"
                  stroke="var(--color-positive)"
                  stackId="1"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex justify-center items-center h-[250px]">
              <p className="text-gray-500">Not enough data to display chart</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
