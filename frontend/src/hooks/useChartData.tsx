import { fetchChartData } from "@/services/api"; // Assuming you will create this API function
// src/hooks/useChartData.ts
import { useQuery } from "@tanstack/react-query";

interface ChartData {
  video_id: string;
  comments: {
    id: string;
    published_at: string;
    sentiment_label: string | null;
  }[];
}

export function useChartData(videoId: string) {
  return useQuery<ChartData, Error>({
    queryKey: ["chartData", videoId],
    queryFn: () => fetchChartData(videoId), // This will call your API function
    enabled: !!videoId, // Only fetch if videoId is present
    staleTime: 1000 * 60 * 2, // Cache the data for 2 minutes before re-fetching
  });
}
