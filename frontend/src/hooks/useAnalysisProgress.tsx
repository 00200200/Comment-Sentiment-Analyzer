import type { CommentAnalysisProgress } from "@/types/CommentAnalysisProgress";
import { getAnalysisProgress } from "@/services/api";
// src/hooks/useAnalysisProgress.ts
import { useQuery } from "@tanstack/react-query";

export function useAnalysisProgress(videoId: string) {
  return useQuery<CommentAnalysisProgress, Error>({
    queryKey: ["analysisProgress", videoId],
    queryFn: () => getAnalysisProgress(videoId),
    enabled: !!videoId,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 5, // Poll every 5 seconds
  });
}
