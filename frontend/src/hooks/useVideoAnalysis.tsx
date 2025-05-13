import type { AnalyzeResponse } from "@/types/VideoResponse";
import { analyzeVideo } from "@/services/api";
// src/hooks/useVideoAnalysis.ts
import { useQuery } from "@tanstack/react-query";

export function useVideoAnalysis(videoUrl: string) {
  return useQuery<AnalyzeResponse, Error>({
    queryKey: ["videoAnalysis", videoUrl],
    queryFn: () => analyzeVideo(videoUrl),
    enabled: !!videoUrl,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}
