import type { ChartCommentsResponse } from "@/types/ChartCommentsResponse";
import { fetchChartData } from "@/services/commentsApi"; // Updated import path
import { useQuery } from "@tanstack/react-query";

export function useChartData(url: string) {
  return useQuery<ChartCommentsResponse, Error>({
    queryKey: ["chartData", url],
    queryFn: () => fetchChartData(url),
    enabled: !!url,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 3, // Refetch every 2 second
  });
}
