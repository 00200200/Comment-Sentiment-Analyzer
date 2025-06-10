import type { ChartCommentsResponse } from "@/types/ChartCommentsResponse";
import { fetchChartData } from "@/services/commentsApi"; // Updated import path
import { useQuery } from "@tanstack/react-query";

export function useChartData(url: string) {
  return useQuery<ChartCommentsResponse, Error>({
    queryKey: ["chartData", url],
    queryFn: () => fetchChartData(url),
    enabled: !!url,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
