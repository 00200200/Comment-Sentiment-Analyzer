import type { AnalyzeResponse } from "@/types/AnalyzeResponse";
import { analyzeVideo } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useVideoAnalysis(url?: string) {
  return useQuery<AnalyzeResponse, Error>({
    queryKey: ["analyzeVideo", url],
    queryFn: () => analyzeVideo(url!),
    enabled: Boolean(url),
  });
}
